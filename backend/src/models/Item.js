const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            default: 'Materials',
        },
        price: {
            type: Number,
            default: 0,
        },
        unit: {
            type: String,
            enum: ['m³', 'tonne'],
            default: 'tonne',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Item', itemSchema);
