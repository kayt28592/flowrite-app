/**
 * PDF Generator Utility
 * Generate docket PDF with logo, customer info, and submissions table
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate Docket PDF
 * @param {Object} docket - Docket object with customer, submissions, etc.
 */
export const generateDocketPDF = (docket) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors matching the app theme
    const primaryColor = [10, 22, 40]; // Navy blue #0a1628
    const accentColor = [92, 124, 250]; // Blue #5c7cfa
    const greenColor = [46, 204, 113]; // Green #2ecc71
    const textColor = [45, 55, 72]; // Gray-900
    const lightGray = [249, 250, 251]; // Gray-50

    let yPosition = 25;

    // ===== HEADER SECTION =====
    // Background rectangle for header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Company Logo/Name
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FLOWRITE GROUP PTY LTD', 20, yPosition);
    doc.setFontSize(9);
    doc.text('ACN: 632 294 869', 20, yPosition + 6);

    // Docket number badge on the right
    const docketNumWidth = 60;
    const docketNumX = pageWidth - 20 - docketNumWidth;
    doc.setFillColor(...accentColor);
    doc.rect(docketNumX, 15, docketNumWidth, 20, 'F');

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCKET', docketNumX + docketNumWidth / 2, 22, { align: 'center' });
    doc.setFontSize(14);
    doc.text(docket.docketNumber || 'N/A', docketNumX + docketNumWidth / 2, 30, { align: 'center' });

    yPosition = 65;

    // ===== CUSTOMER INFORMATION SECTION =====
    doc.setFillColor(...lightGray);
    doc.rect(20, yPosition - 5, pageWidth - 40, 45, 'F');

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', 25, yPosition);

    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');

    // Customer details in two columns
    const leftCol = 25;
    const rightCol = pageWidth / 2 + 10;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(docket.customer || 'N/A', leftCol + 25, yPosition);

    yPosition += 6;

    if (docket.customerInfo?.email) {
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(docket.customerInfo.email, leftCol + 25, yPosition);
        yPosition += 6;
    }

    // Right column - reset yPosition for right side
    let rightYPos = 73;

    if (docket.customerInfo?.phone) {
        doc.setFont('helvetica', 'bold');
        doc.text('Phone:', rightCol, rightYPos);
        doc.setFont('helvetica', 'normal');
        doc.text(docket.customerInfo.phone, rightCol + 25, rightYPos);
        rightYPos += 6;
    }

    if (docket.customerInfo?.address) {
        doc.setFont('helvetica', 'bold');
        doc.text('Address:', rightCol, rightYPos);
        doc.setFont('helvetica', 'normal');
        const addressText = docket.customerInfo.address;
        if (addressText.length > 35) {
            doc.text(addressText.substring(0, 35), rightCol + 25, rightYPos);
            doc.text(addressText.substring(35), rightCol + 25, rightYPos + 4);
        } else {
            doc.text(addressText, rightCol + 25, rightYPos);
        }
    }

    yPosition = Math.max(yPosition, rightYPos) + 8;

    // Period badge
    const startDate = docket.startDate?.split('T')[0] || docket.startDate;
    const endDate = docket.endDate?.split('T')[0] || docket.endDate;

    doc.setFillColor(...accentColor);
    doc.rect(20, yPosition - 3, pageWidth - 40, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`PERIOD: ${startDate} to ${endDate}`, pageWidth / 2, yPosition + 3, { align: 'center' });

    yPosition += 20;

    // ===== SUBMISSIONS TABLE =====
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('SUBMISSIONS', 20, yPosition);

    yPosition += 5;

    // Prepare table data with signature status
    const tableData = docket.submissions.map((sub) => [
        sub.date || 'N/A',
        sub.order || 'N/A',
        sub.rego || 'N/A',
        sub.address || 'N/A',
        `${sub.amount || 0}`,
        sub.signature ? '✓ Signed' : '✗ N/A'
    ]);

    // Generate table with custom styling
    doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Order', 'Rego', 'Site Address', 'Qty', 'Signature']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle',
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 9,
            textColor: textColor,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: lightGray
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' }, // Date
            1: { cellWidth: 40, halign: 'left' }, // Order
            2: { cellWidth: 25, halign: 'center' }, // Rego
            3: { cellWidth: 45, halign: 'left' }, // Address
            4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Qty
            5: { cellWidth: 25, halign: 'center', textColor: accentColor } // Signature
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
            // Footer on each page
            const pageCount = doc.internal.getNumberOfPages();
            const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

            // Footer line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'normal');
            doc.text(
                'Flowrite Group Pty Ltd | ACN: 632 294 869',
                20,
                pageHeight - 12
            );

            doc.text(
                `Page ${currentPage} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 12,
                { align: 'center' }
            );

            doc.text(
                `Generated: ${new Date().toLocaleDateString()}`,
                pageWidth - 20,
                pageHeight - 12,
                { align: 'right' }
            );
        }
    });

    // Get final Y position after table
    const finalY = doc.lastAutoTable.finalY + 10;

    // ===== TOTAL AMOUNT SECTION =====
    const totalBoxWidth = 80;
    const totalBoxX = pageWidth - 20 - totalBoxWidth;

    doc.setFillColor(...greenColor);
    doc.rect(totalBoxX, finalY, totalBoxWidth, 15, 'F');

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL QUANTITY:', totalBoxX + 5, finalY + 6);
    doc.setFontSize(14);
    doc.text(`${docket.totalAmount?.toFixed(2) || 0} m3`, totalBoxX + totalBoxWidth - 5, finalY + 10, { align: 'right' });

    // ===== FOOTER NOTE =====
    const footerY = finalY + 25;
    if (footerY < pageHeight - 30) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text('This is an official document from Flowrite Group Pty Ltd', pageWidth / 2, footerY, { align: 'center' });
        doc.text('For any queries, please contact our office.', pageWidth / 2, footerY + 4, { align: 'center' });
    }

    // Save PDF
    const fileName = `Docket_${docket.docketNumber}_${docket.customer.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};

/**
 * Generate Preview Docket PDF (for preview before creating)
 */
export const generatePreviewDocketPDF = (previewData) => {
    const docket = {
        docketNumber: 'PREVIEW',
        customer: previewData.customer,
        customerInfo: previewData.customerInfo || {},
        startDate: previewData.startDate,
        endDate: previewData.endDate,
        submissions: previewData.submissions,
        totalAmount: previewData.totalAmount
    };

    generateDocketPDF(docket);
};
