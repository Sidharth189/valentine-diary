const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('./models/User');
const Diary = require('./models/Diary');

const app = express();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Session Config
app.use(session({
    secret: 'secret-key', // Change in production
    resave: false,
    saveUninitialized: false
}));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

// --- File Upload Setup ---
const multer = require('multer');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

app.post('/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ imageUrl: '/uploads/' + req.file.filename });
});



// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- Auth Routes ---



app.post('/signup', async (req, res) => {
    const { email, password, confirmPassword, slug } = req.body;
    try {
        if (password !== confirmPassword) return res.send("Passwords do not match");

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.send("User already exists");

        // Check if slug exists
        let diary = await Diary.findOne({ slug });
        if (diary) return res.send("Link name already taken");

        // Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ email, password: hashedPassword });
        await user.save();

        // Create Default Diary
        diary = new Diary({
            user: user._id,
            slug: slug,
            pages: [
                { pageNumber: 1, text: "Chapter 1: The Beginning...", imageUrl: "" },
                { pageNumber: 2, text: "Our story continues...", imageUrl: "" }
            ]
        });
        await diary.save();

        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.send("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Invalid credentials");

        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- Dashboard Routes ---



app.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const diary = await Diary.findOne({ user: req.session.userId });

        // Helper to get page data safely
        const getPage = (num) => {
            const page = diary.pages.find(p => p.pageNumber === num);
            return page || { text: '', imageUrl: '' };
        };

        res.render('dashboard', {
            diary,
            getPage,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.post('/dashboard/save', requireAuth, async (req, res) => {
    try {
        const diary = await Diary.findOne({ user: req.session.userId });

        // Handle pages array from the form
        let newPages = req.body.pages || [];

        // Ensure it's an array (in case of single item quirks)
        if (!Array.isArray(newPages)) {
            newPages = []; // or handle object case if needed
        }

        // Limit to 10 pages
        if (newPages.length > 10) {
            newPages = newPages.slice(0, 10);
        }

        // Format for Schema and Assign Page Numbers
        diary.pages = newPages.map((p, index) => ({
            pageNumber: index + 1,
            text: p.text || "",
            imageUrl: p.imageUrl || ""
        }));

        // Update Title & Description if provided
        if (req.body.title) diary.title = req.body.title;
        if (req.body.description) diary.description = req.body.description;

        // Update Final Page Customizations
        if (req.body.finalQuestion) diary.finalQuestion = req.body.finalQuestion;
        if (req.body.yesLabel) diary.yesLabel = req.body.yesLabel;
        if (req.body.noLabel) diary.noLabel = req.body.noLabel;
        if (req.body.successMessage) diary.successMessage = req.body.successMessage;

        await diary.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// --- Public Diary Route ---

app.get('/u/:slug', async (req, res) => {
    try {
        const diary = await Diary.findOne({ slug: req.params.slug });
        if (!diary) return res.status(404).send("Diary not found");

        const isAuthor = req.session.userId && diary.user.toString() === req.session.userId;

        // Lock if unpaid AND not the author
        if (!diary.isPaid && !isAuthor) {
            return res.send(`
                <div style="text-align:center; padding:50px; font-family:sans-serif;">
                    <h1>🔒 Locked</h1>
                    <p>This diary hasn't been unlocked by the author yet.</p>
                </div>
            `);
        }

        // Helper to get page data
        const getPage = (num) => {
            const page = diary.pages.find(p => p.pageNumber === num);
            return page || { text: '', imageUrl: '' };
        };

        res.render('diary', {
            diary,
            getPage,
            isPreview: !diary.isPaid && isAuthor
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// --- Payment Routes ---

app.post('/create-order', requireAuth, async (req, res) => {
    try {
        const options = {
            amount: 900, // amount in the smallest currency unit (9 INR * 100 paise)
            currency: "INR",
            receipt: "order_rcptid_" + req.session.userId
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating order");
    }
});

app.post('/verify-payment', requireAuth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment Success! Update Database
            const diary = await Diary.findOne({ user: req.session.userId });
            diary.isPaid = true;
            await diary.save();

            res.json({ status: "success" });
        } else {
            res.status(400).json({ status: "failure" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error verifying payment");
    }
});



// --- Root Route ---
app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('index');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
