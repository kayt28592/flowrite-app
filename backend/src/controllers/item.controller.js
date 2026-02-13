const asyncHandler = require('express-async-handler');
const itemService = require('../services/item.service');

const getItems = asyncHandler(async (req, res) => {
    const result = await itemService.getItems(req.query);
    res.status(200).json({ success: true, ...result });
});

const createItem = asyncHandler(async (req, res) => {
    const item = await itemService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
});

const updateItem = asyncHandler(async (req, res) => {
    const item = await itemService.updateItem(req.params.id, req.body);
    res.status(200).json({ success: true, data: item });
});

const deleteItem = asyncHandler(async (req, res) => {
    await itemService.deleteItem(req.params.id);
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
});

module.exports = { getItems, createItem, updateItem, deleteItem };
