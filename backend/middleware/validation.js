const Joi = require('joi');

const bidSchema = Joi.object({
    tenderId: Joi.string().required(),
    totalAmount: Joi.number().min(0).required(),
    validityPeriod: Joi.number().min(30).required(),
    notes: Joi.string().allow('', null).max(500),
    // File URLs would ideally be validated as URLs
    technicalProposalUrl: Joi.string().required(),
    financialProposalUrl: Joi.string().required()
});

const tenderSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).required(),
    type: Joi.string().valid('Open Tender', 'Restricted Tender', 'RFQ').required(),
    category: Joi.string().required(),
    closingDate: Joi.date().greater('now').required(),
    openingDate: Joi.date().greater(Joi.ref('closingDate')).required(),
    budget: Joi.number().optional()
});

const validateBid = (req, res, next) => {
    const { error } = bidSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

const validateTender = (req, res, next) => {
    const { error } = tenderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

module.exports = { validateBid, validateTender };
