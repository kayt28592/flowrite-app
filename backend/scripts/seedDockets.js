const mongoose = require('mongoose');
require('dotenv').config();
const Submission = require('../src/models/Submission');
const Docket = require('../src/models/Docket');
const Customer = require('../src/models/Customer');
const User = require('../src/models/User');
const { connectDB } = require('../src/config/database');

const seedDocketsData = async () => {
    try {
        await connectDB();

        // 1. Get an admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.error('❌ No admin user found. Please create one first.');
            process.exit(1);
        }

        // 2. Create or find customers
        const customerNames = ['Apex Construction', 'City Infrastructure', 'Bulk Earthworks'];
        const customers = [];
        for (const name of customerNames) {
            let cust = await Customer.findOne({ name });
            if (!cust) {
                cust = await Customer.create({
                    name,
                    email: `contact@${name.toLowerCase().replace(' ', '')}.com`,
                    phone: '0400123456',
                    address: `123 ${name} St, Industrial Park`,
                    createdBy: admin._id
                });
                console.log(`✅ Created customer: ${name}`);
            }
            customers.push(cust);
        }

        const apexCust = customers[0];

        // 3. Create some submissions for Apex Construction
        const submissionsData = [
            {
                customer: apexCust.name,
                address: 'Apex Site A',
                order: 'Recycled Aggregate 20mm',
                amount: 15.5,
                rego: 'TRUCK-01',
                date: new Date().toISOString().split('T')[0],
                time: '08:30 AM',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
            },
            {
                customer: apexCust.name,
                address: 'Apex Site A',
                order: 'Recycled Aggregate 20mm',
                amount: 14.2,
                rego: 'TRUCK-02',
                date: new Date().toISOString().split('T')[0],
                time: '10:15 AM',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
            },
            {
                customer: apexCust.name,
                address: 'Apex Site B',
                order: 'Road Base',
                amount: 22.0,
                rego: 'TRUCK-01',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                time: '02:45 PM',
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
            }
        ];

        const createdSubmissions = await Submission.insertMany(submissionsData.map(s => ({ ...s, createdBy: admin._id })));
        console.log(`✅ Created ${createdSubmissions.length} submissions`);

        // 4. Create a Docket for Apex Construction consuming these submissions
        const docketData = {
            customer: apexCust.name,
            customerInfo: {
                email: apexCust.email,
                phone: apexCust.phone,
                address: apexCust.address
            },
            startDate: new Date(Date.now() - 2 * 86400000),
            endDate: new Date(),
            submissions: createdSubmissions.map(s => s._id),
            totalAmount: createdSubmissions.reduce((sum, s) => sum + s.amount, 0),
            status: 'final',
            createdBy: admin._id
        };

        const docket = await Docket.create(docketData);
        console.log(`✅ Created docket: ${docket.docketNumber}`);

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDocketsData();
