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
    // Final Page Customizations
    finalQuestion: {
        type: String,
        default: "Will you be my Valentine?"
    },
    yesLabel: {
        type: String,
        default: "Yes! ❤️"
    },
    noLabel: {
        type: String,
        default: "No"
    },
    successMessage: {
        type: String,
        default: "Yay! ❤️ I love you!"
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
