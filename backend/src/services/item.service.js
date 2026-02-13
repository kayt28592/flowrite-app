const Item = require('../models/Item');
const { ErrorResponse } = require('../middleware/error.middleware');

const getItems = async (query) => {
    const { search, isActive } = query;
    let filter = {};
    if (search) {
        filter.name = new RegExp(search, 'i');
    }
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const items = await Item.find(filter).sort({ name: 1 });
    return { items, count: items.length };
};

const createItem = async (data) => {
    return await Item.create(data);
};

const updateItem = async (id, data) => {
    const item = await Item.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw new ErrorResponse('Item not found', 404);
    return item;
};

const deleteItem = async (id) => {
    const item = await Item.findByIdAndDelete(id);
    if (!item) throw new ErrorResponse('Item not found', 404);
    return item;
};

module.exports = { getItems, createItem, updateItem, deleteItem };
