const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.dev') });
const mongoose = require('mongoose');
const FormTemplate = require('../models/FormTemplate');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const fixStatus = async () => {
    await connectDB();

    try {
        const result = await FormTemplate.updateMany({}, {
            $set: { status: 'published' }
        });
        console.log('Updated templates:', result.modifiedCount);
    } catch (err) {
        console.error('Update failed:', err);
    }

    process.exit();
};

fixStatus();
