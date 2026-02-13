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

const seedForm = async () => {
    await connectDB();

    const title = "OPERATOR DAILY PRE-START FORM";

    // Check if exists
    const existing = await FormTemplate.findOne({ title, isDeleted: false });
    if (existing) {
        console.log(`Template "${title}" already exists.`);
        process.exit(0);
    }

    console.log(`Creating template "${title}"...`);

    const checklistItems = [
        { id: 'gauges', label: 'Gauges and Warning Lights' },
        { id: 'filters', label: 'Blow out Filters/ AC Filters/ Grease Machine' },
        { id: 'lights', label: 'Brake and Indicator Lights Operational' },
        { id: 'pins', label: 'Pins - Pivots, Rams, Lift Arms, Bucket Pins, Quick Release' },
        { id: 'mirrors', label: 'Mirrors & Windows - Clean and Undamaged' },
        { id: 'spillKit', label: 'Spill kit & First Aid on board or available on onsite' },
        { id: 'horn', label: 'Horn & Flashing Lights operational' },
        { id: 'fluids', label: 'Fluid levels checked & topped up as required (coolant, oils, water, air, fuel)' },
        { id: 'steering', label: 'Steering Controls, Wipers, Levers, Buckets' },
        { id: 'groundTool', label: 'Ground Engaging Tools' },
        { id: 'tyres', label: 'Tyres/ Tracks - wear and tear' },
        { id: 'brakes', label: 'Check Brakes (park/foot/retarder/emergency)' },
        { id: 'hydraulics', label: 'Hydraulics - Leaks, Damage, Connections' },
        { id: 'guards', label: 'Guards - In Place, Secure, Warnings' },
        { id: 'steps', label: 'Steps, Handrails & Handholds are operational' },
        { id: 'safetyCutOut', label: 'Safety Cut Out ( E STOP)' },
        { id: 'tieDown', label: 'Tie Down Straps/Chains (if applicable) in good condition' },
        { id: 'extinguisher', label: 'In Date Fire Extinguisher on board' },
        { id: 'alarm', label: 'Travel Alarms operational' },
        { id: 'rops', label: 'ROPS & FOPS' }
    ];

    const fields = [
        // Section 1: General Info
        {
            id: 'general_heading',
            type: 'heading',
            label: 'General Information',
            order: 1
        },
        {
            id: 'worker_name',
            type: 'text',
            label: 'Worker Name',
            placeholder: 'Enter your name',
            required: true,
            order: 2
        },
        {
            id: 'plant',
            type: 'text',
            label: 'Plant',
            placeholder: 'e.g. Excavator 01',
            required: true,
            order: 3
        },
        {
            id: 'machine_hours',
            type: 'number',
            label: 'Machine HRS',
            placeholder: '0000.0',
            required: true,
            order: 4
        },
        {
            id: 'date',
            type: 'date',
            label: 'Date',
            required: true,
            order: 5
        },

        // Section 2: Before Start Up
        {
            id: 'declarations',
            type: 'declaration',
            label: 'Before Start Up',
            required: true,
            items: [
                { id: 'fitForWork', label: 'I declare that I am Fit for Work. I am not under the influence of drugs, alcohol or any prescribed medications and I am aware of Flowrite Group\'s Zero Tolerance Policy.' },
                { id: 'covid19', label: 'I declare that I have taken precautions to mitigate the spread of COVID-19. I have no flu like symptoms.' },
                { id: 'riskAssessment', label: 'I have performed a visual risk assessment to determine that my work area is safe to work in.' }
            ],
            order: 6
        },

        // Section 3: Checklist
        {
            id: 'checklist',
            type: 'checklist',
            label: 'Pre-Start Checklist',
            required: true,
            items: checklistItems,
            order: 7
        },

        // Section 4: Comments
        {
            id: 'notes_heading',
            type: 'heading',
            label: 'Notes & Actions',
            order: 8
        },
        {
            id: 'comments_defect',
            type: 'textarea',
            label: 'Comments & Defect',
            placeholder: 'Describe any defects or comments...',
            order: 9
        },
        {
            id: 'action_taken',
            type: 'textarea',
            label: 'Action Taken',
            placeholder: 'Describe actions taken...',
            order: 10
        },

        // Section 5: Photos
        {
            id: 'photos_heading',
            type: 'heading',
            label: 'Photos',
            order: 11
        },
        {
            id: 'photo1',
            type: 'image',
            label: 'Photo of Damage (If Any)',
            order: 12
        },
        {
            id: 'photo2',
            type: 'image',
            label: 'Photo 2',
            order: 13
        },
        {
            id: 'photo3',
            type: 'image',
            label: 'Photo 3',
            order: 14
        },
        {
            id: 'photo4',
            type: 'image',
            label: 'Photo 4',
            order: 15
        },

        // Section 6: Signature
        {
            id: 'signature',
            type: 'signature',
            label: 'Signature',
            required: true,
            order: 16
        }
    ];

    try {
        await FormTemplate.create({
            title,
            description: "Daily pre-start check for operators",
            fields,
            status: 'published',
            version: 1
        });
        console.log('Template created successfully');
    } catch (err) {
        console.error('Error creating template:', err);
    }

    process.exit(0);
};

seedForm();
