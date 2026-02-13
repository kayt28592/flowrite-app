const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const Submission = require('../models/Submission');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Customer.deleteMany();
        await Item.deleteMany();
        await Submission.deleteMany();
        console.log('Cleared existing data.');

        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@flowrite.com',
            password: 'password123',
            role: 'admin'
        });
        console.log('Admin user created.');

        // Create Manager User
        await User.create({
            name: 'Manager User',
            email: 'manager@flowrite.com',
            password: 'password123',
            role: 'manager',
            permissions: {
                view_users: true,
                view_reports: true,
                manage_customers: true,
                manage_items: true
            }
        });
        console.log('Manager user created.');

        // Create Regular User
        await User.create({
            name: 'Regular User',
            email: 'user@flowrite.com',
            password: 'password123',
            role: 'user',
            permissions: {
                create_dockets: true,
                view_dockets: true
            }
        });
        console.log('Regular user created.');

        // Create Test Items
        const items = [
            { name: '40MM AGG', category: 'Materials', price: 120 },
            { name: '20MM AGG', category: 'Materials', price: 130 },
            { name: 'CONCRETE MIX', category: 'Materials', price: 150 },
            { name: 'SAND', category: 'Materials', price: 80 }
        ];
        await Item.insertMany(items);
        console.log('Test items created.');

        // Create Test Customers
        const customers = [
            {
                name: 'John Doe Construction',
                email: 'john@doe.com',
                phone: '0412345678',
                address: '123 Build St, Sydney NSW 2000',
                createdBy: admin._id
            },
            {
                name: 'Jane Smith Materials',
                email: 'jane@smith.com',
                phone: '0487654321',
                address: '456 Concrete Rd, Melbourne VIC 3000',
                createdBy: admin._id
            }
        ];

        await Customer.insertMany(customers);
        console.log('Test customers created.');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
