const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.dev') });
const mongoose = require('mongoose');
const Docket = require('../models/Docket');
const Submission = require('../models/Submission'); // Populate uses this
const Item = require('../models/Item');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const fixRevenue = async () => {
    await connectDB();

    // Fetch all item prices first for efficiency
    const allItems = await Item.find({});
    const priceMap = {};
    allItems.forEach(i => priceMap[i.name] = i.price);

    const dockets = await Docket.find({}).populate('submissions');
    console.log(`Checking ${dockets.length} dockets...`);

    let updatedCount = 0;

    for (const docket of dockets) {
        let newTotal = 0;

        if (docket.submissions && docket.submissions.length > 0) {
            newTotal = docket.submissions.reduce((sum, sub) => {
                const price = priceMap[sub.order] || 0;
                return sum + (sub.amount * price);
            }, 0);
        }

        // Update if significantly different (handle float issues)
        if (Math.abs(docket.totalAmount - newTotal) > 0.01) {
            console.log(`Updating Docket ${docket.docketNumber}: Old $${docket.totalAmount} -> New $${newTotal}`);
            docket.totalAmount = newTotal;
            await docket.save();
            updatedCount++;
        }
    }

    console.log(`\nUpdate Complete: ${updatedCount} dockets fixed.`);
    process.exit();
};

fixRevenue();
