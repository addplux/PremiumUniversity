const Shipment = require('../models/Shipment');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Create shipment record
// @route   POST /api/logistics/shipment
// @access  Private
exports.createShipment = async (req, res) => {
    try {
        const shipmentData = {
            ...req.body,
            organizationId: req.organizationId,
            events: [{
                status: 'Created',
                description: 'Shipment record created in system',
                timestamp: new Date()
            }]
        };
        const shipment = await Shipment.create(shipmentData);

        // Update PO status if linked
        if (shipment.purchaseOrderId) {
            await PurchaseOrder.findByIdAndUpdate(shipment.purchaseOrderId, {
                status: 'In Transit'
            });
        }

        res.status(201).json({ success: true, data: shipment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Track shipment
// @route   GET /api/logistics/track/:trackingNumber
// @access  Private
exports.trackShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            trackingNumber: req.params.trackingNumber,
            organizationId: req.organizationId
        }).populate('supplierId', 'name');

        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        res.json({ success: true, data: shipment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update shipment location/status (Simulated webhook)
// @route   PUT /api/logistics/shipment/:id/update
// @access  Private
exports.updateShipmentStatus = async (req, res) => {
    try {
        const { status, location, description } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) return res.status(404).json({ message: 'Not found' });

        shipment.status = status;
        shipment.currentLocation = location; // { address, coordinates }
        shipment.events.push({
            status,
            location: location?.address,
            description: description || `Status updated to ${status}`,
            timestamp: new Date()
        });

        await shipment.save();
        res.json({ success: true, data: shipment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
