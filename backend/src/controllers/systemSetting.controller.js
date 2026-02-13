const asyncHandler = require('express-async-handler');
const SystemSetting = require('../models/SystemSetting');
const { ErrorResponse } = require('../middleware/error.middleware');

const getSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSetting.find();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.status(200).json({ success: true, data: settingsMap });
});

const updateSetting = asyncHandler(async (req, res) => {
    const { key, value } = req.body;

    let setting = await SystemSetting.findOne({ key });

    if (setting) {
        setting.value = value;
        await setting.save();
    } else {
        setting = await SystemSetting.create({ key, value });
    }

    res.status(200).json({ success: true, data: setting });
});

// Default RBAC Matrix initialization
const initializeDefaults = async () => {
    const DEFAULT_RBAC = {
        Staff: {
            dockets: {
                docketForm: { view: true, create: true },
                list: { view: true },
                submissions: { view: true },
                customers: { view: true },
                items: { view: true }
            },
            jobForms: {
                manageForms: { view: true },
                designTool: { view: false }
            },
            timesheets: {
                my: { view: true, create: true },
                team: { view: false }
            }
        },
        Supervisor: {
            dockets: {
                docketForm: { view: true, create: true },
                list: { view: true, edit: true },
                submissions: { view: true, edit: true, approve: true, print: true },
                customers: { view: true, create: true },
                items: { view: true, create: true }
            },
            jobForms: {
                manageForms: { view: true, edit: true },
                designTool: { view: true }
            },
            timesheets: {
                my: { view: true, create: true },
                team: { view: false }
            }
        },
        Administrator: {
            dockets: {
                docketForm: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                list: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                submissions: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                customers: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                items: { view: true, create: true, edit: true, delete: true, print: true, approve: true }
            },
            jobForms: {
                manageForms: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                designTool: { view: true, create: true, edit: true, delete: true, print: true, approve: true }
            },
            timesheets: {
                my: { view: true, create: true, edit: true, delete: true, print: true, approve: true },
                team: { view: true, create: true, edit: true, delete: true, print: true, approve: true }
            }
        },
        Guest: {
            dockets: {},
            jobForms: {},
            timesheets: {}
        }
    };

    const existing = await SystemSetting.findOne({ key: 'rbac_matrix' });
    if (!existing) {
        await SystemSetting.create({ key: 'rbac_matrix', value: DEFAULT_RBAC, description: 'Role Based Access Control Matrix' });
    }
};

module.exports = { getSettings, updateSetting, initializeDefaults };
