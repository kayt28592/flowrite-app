const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.dev') });
const mongoose = require('mongoose');
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

const checkPrices = async () => {
    await connectDB();
    
    const items = await Item.find({});
    console.log(`\nTotal Items: ${items.length}`);
    console.log('----------------------------');
    
    let hasZeroPrice = 0;
    
    items.forEach(i => {
        console.log(`[Item] ${i.name} - Price: $${i.price}`);
        if(i.price === 0) hasZeroPrice++;
    });
    
    if (hasZeroPrice > 0) {
        console.log(`\n⚠️ Warning: ${hasZeroPrice} items have a price of $0.`);
    }

    process.exit();
};

checkPrices();
