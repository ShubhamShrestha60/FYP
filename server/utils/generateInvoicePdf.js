const PDFDocument = require('pdfkit');

/**
 * Generate a detailed, professional invoice PDF for an order.
 * @param {Object} order - The order object (populated with items.product)
 * @returns {Promise<Buffer>} - Resolves to a PDF buffer
 */
function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Company Header
      doc.fontSize(18).font('Helvetica-Bold').text('Opera Eye Wear', { align: 'left' });
      doc.fontSize(10).font('Helvetica').text('Nepal', { align: 'left' });
      doc.text('Phone: 9702044580', { align: 'left' });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#222').lineWidth(1.5).stroke();
      doc.moveDown(1);

      // Invoice Title and Info
      doc.fontSize(22).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica').text(`Invoice #: ${order._id}`, { align: 'right' });
      doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}`, { align: 'right' });
      doc.moveDown(1);

      // Bill To & Ship To
      const yStart = doc.y;
      doc.font('Helvetica-Bold').fontSize(11).text('Bill To:', 40, yStart);
      doc.font('Helvetica').fontSize(10).text(`${order.customer.name || ''}`, 40, doc.y + 2);
      doc.text(`${order.customer.email || ''}`, 40, doc.y);
      doc.text(`${order.customer.phone || ''}`, 40, doc.y);

      const shipX = 300;
      doc.font('Helvetica-Bold').fontSize(11).text('Ship To:', shipX, yStart);
      doc.font('Helvetica').fontSize(10).text(
        `${order.shippingAddress.address || ''}
${order.shippingAddress.city || ''}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''}
${order.shippingAddress.postalCode || ''}
${order.shippingAddress.country || ''}`,
        shipX, doc.y + 2
      );
      doc.moveDown(2);

      // Section Divider
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(1);

      // Order Items Table
      doc.font('Helvetica-Bold').fontSize(12).text('Order Items', 40);
      doc.moveDown(0.5);
      // Table Headers
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('PRODUCT', 40, doc.y, { continued: true });
      doc.text('QUANTITY', 220, doc.y, { continued: true });
      doc.text('PRICE', 300, doc.y, { continued: true });
      doc.text('TOTAL', 400, doc.y);
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(10);
      // Table Rows with alternating background
      let rowY = doc.y;
      order.items.forEach((item, idx) => {
        if (idx % 2 === 1) {
          doc.rect(40, rowY - 2, doc.page.width - 80, 18).fill('#f7f7f7').fillColor('black');
        }
        doc.text(item.product ? item.product.name : '', 40, rowY, { continued: true });
        doc.text(item.quantity.toString(), 220, rowY, { continued: true });
        doc.text(`Rs. ${item.price.toFixed(2)}`, 300, rowY, { continued: true });
        doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 400, rowY);
        rowY = doc.y;
        // Lens options, if any
        if (item.lensOptions) {
          doc.fontSize(9).fillColor('#555555').text(`Lens Type: ${item.lensOptions.type || ''}`, 50, rowY);
          if (item.lensOptions.coating) doc.text(`Coating: ${item.lensOptions.coating}`, 50, doc.y);
          if (item.lensOptions.price) doc.text(`Lens Price: Rs. ${item.lensOptions.price}`, 50, doc.y);
          doc.fontSize(10).fillColor('black');
          rowY = doc.y;
        }
        doc.moveDown(0.5);
        rowY = doc.y;
      });
      doc.moveDown(1);

      // Section Divider
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(1);

      // Summary
      doc.font('Helvetica-Bold').fontSize(10).text('Subtotal:', 350, doc.y, { continued: true });
      doc.font('Helvetica').text(`Rs. ${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}`, 450, doc.y);
      doc.font('Helvetica-Bold').fontSize(10).text('Shipping:', 350, doc.y, { continued: true });
      doc.font('Helvetica').text(`Rs. ${order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'}`, 450, doc.y);
      if (order.discount) {
        doc.font('Helvetica-Bold').fontSize(10).text('Discount:', 350, doc.y, { continued: true });
        doc.font('Helvetica').text(`- Rs. ${order.discount.toFixed(2)}`, 450, doc.y);
      }
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12).text('Total:', 350, doc.y, { continued: true });
      doc.font('Helvetica-Bold').fontSize(12).text(`Rs. ${order.total ? order.total.toFixed(2) : '0.00'}`, 450, doc.y);
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10).text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 350, doc.y);
      doc.font('Helvetica').fontSize(10).text(`Payment Status: ${order.paymentStatus || 'N/A'}`, 350, doc.y);
      doc.moveDown(2);

      // Section Divider
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#cccccc').lineWidth(1).stroke();
      doc.moveDown(1);

      // Footer
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#888888').text('Thank you for your purchase!', { align: 'center' });
      doc.font('Helvetica').fontSize(9).fillColor('#888888').text('For support, contact us at 9702044580', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateInvoicePdf; 