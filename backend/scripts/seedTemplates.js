const mongoose = require('mongoose');
require('dotenv').config();
const FormTemplate = require('../src/models/FormTemplate');
const { connectDB } = require('../src/config/database');

const seedTemplates = async () => {
    try {
        await connectDB();

        // Clear existing templates if requested (optional)
        // await FormTemplate.deleteMany({});

        const templates = [
            {
                title: "Daily Machine Pre-Start",
                description: "Standard daily safety inspection for heavy machinery and light vehicles.",
                status: "published",
                fields: [
                    { id: "h1", type: "heading", label: "Fatigue & Fitness", order: 0 },
                    { id: "q1", type: "checkbox", label: "I am fit for work and not under the influence of drugs/alcohol", required: true, order: 1 },
                    { id: "q2", type: "select", label: "Sleep hours last night", options: ["Less than 6", "6-8 hours", "8+ hours"], required: true, order: 2 },
                    { id: "h2", type: "heading", label: "Mechanical Inspection", order: 3 },
                    { id: "q3", type: "checkbox", label: "Oil, Coolant and Hydraulic fluids checked", required: true, order: 4 },
                    { id: "q4", type: "checkbox", label: "Tires, Tracks and Ground engaging tools ok", required: true, order: 5 },
                    { id: "q5", type: "checkbox", label: "Lights, Horn and Reverse alarm functional", required: true, order: 6 },
                    { id: "p1", type: "image", label: "Overall machine condition photo", required: false, order: 7 },
                    { id: "s1", type: "signature", label: "Operator Signature", required: true, order: 8 }
                ]
            },
            {
                title: "Site Hazard Report",
                description: "Immediate reporting of safety hazards found on site.",
                status: "published",
                fields: [
                    { id: "loc", type: "text", label: "Exact Location", placeholder: "e.g. North Pit, Shed 2", required: true, order: 0 },
                    { id: "type", type: "select", label: "Hazard Type", options: ["Slip/Trip/Fall", "Electrical", "Chemical/Spill", "Dropped Object", "Vehicle Interaction", "Other"], required: true, order: 1 },
                    { id: "desc", type: "textarea", label: "Description of Hazard", placeholder: "Explain what you found and any immediate actions taken...", required: true, order: 2 },
                    { id: "img", type: "image", label: "Reference Photo", required: false, order: 3 },
                    { id: "worker_name", type: "text", label: "Reported By", placeholder: "Your Full Name", required: true, order: 4 }
                ]
            }
        ];

        for (const t of templates) {
            const exists = await FormTemplate.findOne({ title: t.title });
            if (!exists) {
                await FormTemplate.create(t);
                console.log(`✅ Seeded template: ${t.title}`);
            } else {
                console.log(`ℹ️ Template already exists: ${t.title}`);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding templates:', err);
        process.exit(1);
    }
};

seedTemplates();
