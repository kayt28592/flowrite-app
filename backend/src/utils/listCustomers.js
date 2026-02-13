const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.dev') });
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const listCustomers = async () => {
    await connectDB();

    const customers = await Customer.find({}).sort({ name: 1 });
    console.log(`\nTotal Customers: ${customers.length}`);
    console.log('-----------------------------------');
    customers.forEach((c, i) => {
        console.log(`${i + 1}. [${c.name}] (${c.email})`);
    });

    process.exit();
};

listCustomers();
