const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
// Adjust paths as necessary based on where this script is located
const User = require('../models/User');
const Customer = require('../models/Customer');
const Submission = require('../models/Submission');

// Load env - robust strategy
dotenv.config(); // Try current directory
if (!process.env.MONGODB_URI) {
    // Try relative to this file (backend/src/utils -> backend/.env)
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const seedSubmissions = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Use environment variable or fallback to known Atlas URI for dev
        const uri = process.env.MONGODB_URI || 'mongodb+srv://flowrite-admin:okJlajRjX1TxXwzp@cluster0.ohojm44.mongodb.net/?appName=Cluster0';

        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        // Get admin user
        const admin = await User.findOne({ email: 'admin@flowrite.com' });
        if (!admin) {
            console.error('Admin user not found. Run seedDatabase.js first.');
            process.exit(1);
        }

        // Get customer
        const customer = await Customer.findOne({ name: 'John Doe Construction' });
        if (!customer) {
            console.error('Customer not found. Run seedDatabase.js first.');
            process.exit(1);
        }

        console.log(`Seeding submissions for customer: ${customer.name}`);

        // Create 5 submissions over the last 5 days
        const submissions = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i); // Past dates
            const dateString = date.toISOString().split('T')[0];

            submissions.push({
                date: dateString,
                time: '08:00 AM',
                customer: customer.name,
                address: '123 Test Site, Sydney', // Hardcoded address
                order: '20MM AGG',
                amount: (10 + i), // Varying amounts
                rego: `TEST-${100 + i}`,
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // Dummy signature
                createdBy: admin._id
            });
        }

        await Submission.insertMany(submissions);
        console.log(`Successfully created ${submissions.length} submissions.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding submissions:', error);
        process.exit(1);
    }
};

seedSubmissions();
