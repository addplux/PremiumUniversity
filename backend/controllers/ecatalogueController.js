const ECatalogueItem = require('../models/ECatalogueItem');
const PurchaseRequisition = require('../models/PurchaseRequisition');

// @desc    Get Catalogue Items (Search/Filter)
// @route   GET /api/ecatalogue
// @access  Private
exports.getCatalogueItems = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { organizationId: req.organizationId, isAvailable: true };

        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }

        const items = await ECatalogueItem.find(query);
        res.json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Checkout - Create Draft Requisition
// @route   POST /api/ecatalogue/checkout
// @access  Private
exports.checkoutParams = async (req, res) => {
    try {
        const { items } = req.body; // Array of { itemId, quantity }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Fetch full item details to get price and names correctly
        const itemIds = items.map(i => i.itemId);
        const dbItems = await ECatalogueItem.find({ _id: { $in: itemIds } });

        const requisitionItems = items.map(cartItem => {
            const product = dbItems.find(p => p._id.toString() === cartItem.itemId);
            return {
                description: product.name,
                quantity: cartItem.quantity,
                unit: product.unitOfMeasure,
                estimatedUnitPrice: product.unitPrice,
                estimatedTotal: product.unitPrice * cartItem.quantity
            };
        });

        const totalAmount = requisitionItems.reduce((acc, item) => acc + item.estimatedTotal, 0);

        const requisition = await PurchaseRequisition.create({
            organizationId: req.organizationId,
            requisitionNumber: `PR-CAT-${Date.now()}`,
            departmentId: req.user.departmentId,
            requestedBy: req.user._id,
            status: 'Draft',
            type: 'Standard', // Catalogue Purchase
            items: requisitionItems,
            totalAmount: totalAmount,
            notes: 'Generated from E-Catalogue Checkout'
        });

        res.status(201).json({ success: true, message: 'Requisition created', data: requisition });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
