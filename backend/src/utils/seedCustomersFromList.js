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

const customers = [
    { name: "A & R Haulage", email: "accounts@arhaulage.com.au" },
    { name: "AA Drott Hire", email: "aadrotthire@gmail.com" },
    { name: "Able Earthmoving Pty Ltd", email: "info@abledemolition.com.au" },
    { name: "All Cleared Up Pty Ltd", email: "info@allcleared.au" },
    { name: "BCAV Operations Trust", email: "info@bcav.com.au" },
    { name: "Bluecroft Pty Ltd T/As Francis Excavation", email: "bluecroft12@bigpond.com" },
    { name: "Boulder Walls Construction", email: "ap@bwc.net.au" },
    { name: "Brissy Bins", email: "brissybins@gmail.com" },
    { name: "CJC Transport", email: "admin@cjctransport.com.au" },
    { name: "Cleeland Earthmoving Pty Ltd", email: "michaelcleeland1@bigpond.com" },
    { name: "Coast 2 Coast Earthmoving", email: "suppliers@coast2coast.com.au" },
    { name: "Cobble Patch Logan", email: "cobblepatchlogan@gmail.com" },
    { name: "Colbeze Excavations Pty Ltd", email: "colbysteer@gmail.com" },
    { name: "Construction Sciences", email: "leith.mccambridge@constructionsciences.net" },
    { name: "Debret Pty Ltd", email: "admin@debret.com.au" },
    { name: "Eastern Plant Hire Pty Ltd", email: "queensland@ephgroup.com.au" },
    { name: "Gumdale Demolition", email: "accounts@gumdaledemolition.com.au" },
    { name: "GWT Earthmoving", email: "admin@gwtearthmoving.com.au" },
    { name: "J J Pools", email: "info@jjpools.com.au" },
    { name: "JG Plumbing and Drainage", email: "justin@jgplumbinganddrainage.com" },
    { name: "Jopa (Queensland Pty Ltd)", email: "accounts@jopaenterprises.com.au" },
    { name: "Leighton Sand & Gravel Pty Ltd", email: "info@leightonsandgravel.com.au" },
    { name: "LT Build", email: "accounts@ltbuild.com.au" },
    { name: "MDS Earthmoving & Civil", email: "admin@bdggroup.com.au" },
    { name: "Proficient Siteworks Pty Ltd", email: "accounts@proficientsiteworks.com" },
    { name: "Recom Group Pty Ltd trading as Western Landscape Supplies", email: "accounts@westernlandscape.com.au" },
    { name: "Red Rock Homes", email: "admin@redrockhomes.com.au" },
    { name: "Reggi Projects Pty Ltd", email: "vincent@carmdev.com.au" },
    { name: "Right Choice Earthmoving", email: "rrightchoice@hotmail.com" },
    { name: "Rockmate Landscape Supplies", email: "orders@rockmate.com.au" },
    { name: "Site Clean Contracting", email: "adam@sitecleancontracting.com.au" },
    { name: "Steven Cook", email: "stevecookearthmoving@outlook.com" },
    { name: "T & H Levai Pty Ltd", email: "admin@thlevai.com" },
    { name: "Tip Truck Solutions", email: "office@tiptrucksolutions.com.au" },
    { name: "Urban Demolitions And Plant Hire Pty Ltd", email: "accounts@urbandemo.com.au" }
];

const seedCustomers = async () => {
    await connectDB();

    console.log(`Starting to seed ${customers.length} customers...`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const cust of customers) {
        try {
            const result = await Customer.updateOne(
                { email: cust.email },
                {
                    $set: {
                        name: cust.name,
                        email: cust.email,
                        // Set defaults for required fields if not present
                        phone: '0400 000 000',
                        address: 'To Be Updated'
                    },
                    $setOnInsert: {
                        isActive: true
                    }
                },
                { upsert: true }
            );

            if (result.upsertedCount > 0) created++;
            else if (result.modifiedCount > 0) updated++;

        } catch (err) {
            console.error(`Failed to process ${cust.name}:`, err.message);
            errors++;
        }
    }

    console.log(`\nSeeding Complete:`);
    console.log(`- Created: ${created}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Errors: ${errors}`);

    process.exit();
};

seedCustomers();
