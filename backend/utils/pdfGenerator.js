const PDFDocument = require('pdfkit');

const generatePDF = (records) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('Jagadale Farms - Lending Records', 50, 50);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
      
      let yPosition = 120;

      records.forEach((record, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Record header
        doc.fontSize(14).text(`Record ${index + 1}`, 50, yPosition);
        yPosition += 25;

        // Record details
        doc.fontSize(10);
        doc.text(`Name: ${record.name}`, 50, yPosition);
        doc.text(`Amount: ₹${record.amount.toLocaleString()}`, 300, yPosition);
        yPosition += 20;

        doc.text(`Rate of Interest: ${record.rateOfInterest}%`, 50, yPosition);
        doc.text(`Interest: ₹${record.interest.toFixed(2)}`, 300, yPosition);
        yPosition += 20;

        doc.text(`Start Date: ${record.startDate.toLocaleDateString()}`, 50, yPosition);
        doc.text(`Renewal Date: ${record.renewalDate.toLocaleDateString()}`, 300, yPosition);
        yPosition += 20;

        doc.text(`Total Amount: ₹${record.total.toFixed(2)}`, 50, yPosition);
        yPosition += 30;

        // Separator line
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 20;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePDF };
