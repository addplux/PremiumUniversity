const PDFDocument = require('pdfkit');

const generatePOPdf = (po, supplier, res) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(res);

    // Header
    doc.fillColor('#444444')
        .fontSize(20)
        .text('PURCHASE ORDER', 110, 57)
        .fontSize(10)
        .text(po.poNumber, 200, 65, { align: 'right' })
        .text(`Date: ${new Date(po.orderDate).toLocaleDateString()}`, 200, 80, { align: 'right' })
        .moveDown();

    // From / To
    doc.text('Ordered By:', 50, 100)
        .font('Helvetica-Bold')
        .text('Premium University', 50, 115)
        .font('Helvetica')
        .text('123 University Ave', 50, 130)
        .text('City, State 12345', 50, 145)
        .moveDown();

    doc.text('Vendor:', 300, 100)
        .font('Helvetica-Bold')
        .text(supplier.name, 300, 115)
        .font('Helvetica')
        .text(supplier.address.street, 300, 130)
        .text(`${supplier.address.city}, ${supplier.address.state}`, 300, 145)
        .moveDown();

    // Table Header
    const tableTop = 200;
    doc.font('Helvetica-Bold');
    generateTableRow(doc, tableTop, 'Item', 'Description', 'Unit Price', 'Qty', 'Total');
    generateHr(doc, tableTop + 20);
    doc.font('Helvetica');

    // Items
    let i = 0;
    po.items.forEach((item, index) => {
        const y = tableTop + 30 + (i * 30);
        generateTableRow(
            doc,
            y,
            index + 1,
            item.description,
            `$${item.unitPrice.toLocaleString()}`,
            item.quantity,
            `$${item.totalPrice.toLocaleString()}`
        );
        generateHr(doc, y + 20);
        i++;
    });

    // Totals
    const subtotalPosition = tableTop + (i + 1) * 30;
    doc.font('Helvetica-Bold');
    generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', '', `$${po.totalAmount.toLocaleString()}`);

    const taxPosition = subtotalPosition + 20;
    generateTableRow(doc, taxPosition, '', '', 'Tax', '', `$${po.taxAmount.toLocaleString()}`);

    const totalPosition = taxPosition + 25;
    doc.fontSize(12)
        .text('Grand Total', 350, totalPosition)
        .text(`$${po.grandTotal.toLocaleString()}`, 450, totalPosition, { width: 90, align: 'right' });

    // Footer
    const footerTop = totalPosition + 50;
    doc.fontSize(10)
        .text('Payment Terms: ' + po.paymentTerms, 50, footerTop)
        .text('Authorized By: ____________________', 350, footerTop);

    doc.end();
};

function generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(description, 100, y)
        .text(unitCost, 280, y, { width: 90, align: 'right' })
        .text(quantity, 370, y, { width: 90, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

module.exports = { generatePOPdf };
