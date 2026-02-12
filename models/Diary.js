const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: "Our Story"
    },
    description: {
        type: String,
        default: "A diary of us..."
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    // We'll store content for each customizable page
    pages: [
        {
            pageNumber: Number,
            text: String,
            imageUrl: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Diary', DiarySchema);
