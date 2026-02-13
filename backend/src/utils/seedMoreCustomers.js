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
    { name: "A Team Demolition & Civil QLD PTY LTD", email: "accounts.democivil@ateamqld.com.au" },
    { name: "A Team Earthmoving QLD PTY LTD", email: "admin@ateamqld.com.au", phone: "38001893" },
    { name: "ALLROADS PTY LTD", email: "admin@allroads.net.au" },
    { name: "BE Plant Hire", email: "admin@beph.com.au", phone: "32451501" },
    { name: "Beard Construction & Excavation Pty Ltd", email: "nathan-beard@bigpond.com", phone: "412056445" },
    { name: "Blend Projects Co Pty Ltd", email: "accounts@blendprojects.com.au" },
    { name: "Brancatella Plant Hire", email: "admin@brancatella.com.au", phone: "32456066" },
    { name: "Brisbane Civil", email: "david@brisbanecivil.com.au", phone: "38013201" },
    { name: "Brisbane Metal Market", email: "cherie@brisbanemetalmarket.com.au", phone: "38085903" },
    { name: "Brisbane Tipper Services", email: "brisbanetipperservices@gmail.com" },
    { name: "Briswide Excavation", email: "accounts@bris-wide.com" },
    { name: "Cash Sale", email: "brentonralph@yahoo.com" },
    { name: "Chipmunks Tree Lopping", email: "Chipmunks_tree_lopping@outlook.com" },
    { name: "CIP Constructions", email: "daniel.stevens@cipconstruct.com.au" },
    { name: "City Spire Pty Ltd", email: "buildxl@gmail.com" },
    { name: "Civcorp", email: "admin@civcorp.com.au", phone: "07 3807 9346" },
    { name: "Civcorp Pty Ltd", email: "accounts@civcorp.com.au" },
    { name: "Cleeland Earthmoving & Demolition", email: "michaelcleeland1@bigpond.com" },
    { name: "Cornerstone Boulderwalls", email: "info@cbwalls.com.au" },
    { name: "David Robinson Landscaping Pty Ltd", email: "accounts@robinsonlandscaping.com.au" },
    { name: "DemoGroup Pty Ltd", email: "office@demogroup.com.au", phone: "409072468" },
    { name: "Diggit Plant Hire Pty Ltd", email: "diggitinvoices@hotmail.com", phone: "07 32888510" },
    { name: "DJR Plumbing And Drainage Pty Ltd", email: "djardrdrainage@gmail.com" },
    { name: "Earth Fix Australia Pty Ltd", email: "accounts@earthfix.com.au", phone: "07 5546 45953" },
    { name: "Earthtrak (QLD) Pty Ltd", email: "accountspayable.qld@lantrak.com.au" },
    { name: "Eastern Plant Hire", email: "queensland@ephgroup.com" },
    { name: "Excavator Edge Pty Ltd", email: "accounts@excavatoredge.com.au", phone: "451117164" },
    { name: "F & L Gaeta Pty Ltd", email: "fgaeta@bigpond.net.au", phone: "418748818" },
    { name: "Farrell Transport Group Pty Ltd", email: "ap@farrelltransport.com.au" },
    { name: "Flowrite Group", email: "admin@flowritegroup.com" },
    { name: "Greenway Demolition Pty Ltd", email: "info@greenwaydemo.com.au" },
    { name: "Hoffman Civil", email: "accounts@hoffcivil.com.au" },
    { name: "Hutchinson Builders", email: "ap@hutchinsonbuilders.com.au" },
    { name: "Ian Kindt Bobcat Hire", email: "kindt07@bigpond.net.au" },
    { name: "K D Anderson Pty Ltd", email: "kdandersonptyltd@gmail.com", phone: "409161917" },
    { name: "Logan City Council", email: "rcmcreditors@logan.qld.gov.au" },
    { name: "Logan City Council (Road Construction and Maintenance)", email: "accountspayable@logan.qld.gov.au" },
    { name: "Logan City Council RCM/57/2024", email: "accountspayable@logan.qld.gov.au" },
    { name: "Logan Landscapes", email: "shortysexcavations@gmail.com" },
    { name: "Mackay Tipper Hire Pty Ltd", email: "lma08444@bigpond.net.au" },
    { name: "MJ Demolition", email: "mark@mjdemo.com.au" },
    { name: "Moreton Bay Regional Council", email: "craig.dickinson@moretonbay.qld.gov.au", phone: "07 3094 3686" },
    { name: "Multi Span Australia", email: "bill@multispan.com.au", phone: "33099200" },
    { name: "Naric Civil", email: "lonnie@naric.com.au" },
    { name: "Next Level Concrete Pumping", email: "nextlevelconcretepumping@gmail.com", phone: "431462263" },
    { name: "Pelly Group Pty Ltd T/A Pelly-Can", email: "info@pellycanasphalt.com.au", phone: "422747217" },
    { name: "Performance Plumbing Drainage Excavation", email: "Nickle_Levitt@msn.com", phone: "07 32877620" },
    { name: "Pink Plant Hire & Haulage Pty Ltd", email: "admin@pinkphh.com.au", phone: "07 3806 0023" },
    { name: "Power Edging and Concreting", email: "admin.pec@bigpond.com" },
    { name: "Prekaro Projects", email: "accounts@prekaro.com.au", phone: "1300773527" },
    { name: "QFS Plant Hire", email: "accounts@qfsplanthire.com.au" },
    { name: "Qld Gas Services", email: "qldgasservices@bigpond.com" },
    { name: "Recycle and Civil Queensland", email: "accounts@recyclecivilqld.com.au" },
    { name: "Reggie Constructions", email: "vincent@carmdev.com.au" },
    { name: "Rent A Bin", email: "orders@rentabingc.com.au" },
    { name: "RLT Industries Pty Ltd", email: "rtaskis@hotmail.com" },
    { name: "Robert Letts", email: "robertletts@bigpond.com" },
    { name: "Rossix Civil", email: "admin@rossixcivil.com" },
    { name: "Ryan Civil Contracting", email: "brendan@ryancivilcontracting.com.au", phone: "31893002" },
    { name: "Savco Earthmoving Pty Ltd", email: "alex@savcoearthmoving.com.au", phone: "418450744" },
    { name: "Sheldon Resource Recovery Pty Ltd (United Waste Services)", email: "sheldonaccounts@unitedhire.com.au", phone: "07 3206 0022" },
    { name: "Somerset Construction & Civil", email: "accounts@somersetcivil.com.au", phone: "07 5472 8725" },
    { name: "Steve Penfold Transport Pty Ltd", email: "libbymp@bigpond.net.au" },
    { name: "Sunmix", email: "admin@sunmix.com.au" },
    { name: "Superior Haulage", email: "admin@superiorhaulage.com.au" },
    { name: "Task Transport", email: "accounts@tasktransport.com.au", phone: "38884552" },
    { name: "Taylor Tipper Hire", email: "info@taylortipperhire.com.au" },
    { name: "Terracon Projects", email: "mail@terraconprojects.com.au" },
    { name: "Terrain Management", email: "jacques@terrainmanagement.com.au" },
    { name: "Top Notch Kerbs Pty Ltd T/As Top Notch Civil", email: "timw@topnotchcivil.com" },
    { name: "Total Civil and Haulage", email: "totalcivilandhaulage@gmail.com" },
    { name: "Vinton Tree Services", email: "admin@vintontreeservices.com.au" },
    { name: "WJ & M Allendorf T/A WMA Demolition", email: "info@wmademolition.com.au" },
    { name: "Wynnum Concrete Pumping", email: "wynnumconcretepumping@gmail.com" },
    { name: "Young Civil & Excavation Pty Ltd", email: "accounts@youngcivil.com.au", phone: "07 38063347" },
    { name: "Zen Group", email: "mic@zengroup.com.au" }
];

const seedMoreCustomers = async () => {
    await connectDB();

    console.log(`Starting to seed ${customers.length} additional customers...`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const cust of customers) {
        try {
            // Using name as key to separate departments/subsidiaries
            const result = await Customer.updateOne(
                { name: cust.name },
                {
                    $set: {
                        name: cust.name,
                        email: cust.email,
                        phone: cust.phone || '0400 000 000',
                        address: 'To Be Updated' // Standard default
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

seedMoreCustomers();
