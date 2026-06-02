import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export async function generateCertificatePDF({ studentName, programName, duration, certificateNumber, issueDate, appUrl }) {
  const uploadDir = path.join(process.cwd(), 'public', 'certificates');
  const qrDir = path.join(process.cwd(), 'public', 'qr');

  // Ensure directories exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  const pdfFileName = `cert_${certificateNumber}.pdf`;
  const qrFileName = `qr_${certificateNumber}.png`;

  const pdfPath = path.join(uploadDir, pdfFileName);
  const qrPath = path.join(qrDir, qrFileName);

  const verificationUrl = `${appUrl || 'https://internspace.org'}/verify?id=${certificateNumber}`;

  // 1. Generate QR Code image file
  await QRCode.toFile(qrPath, verificationUrl, {
    color: {
      dark: '#0F172A',
      light: '#FFFFFF'
    },
    width: 150
  });

  // 2. Compile PDFDocument (Landscape Letter/A4 is perfect for professional certificates)
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, left: 40, right: 40, bottom: 40 }
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Background Accent Border (Gold Accent)
  doc.rect(20, 20, 802, 555)
     .lineWidth(3)
     .stroke('#C9A227');

  doc.rect(26, 26, 790, 543)
     .lineWidth(1)
     .stroke('#1E293B');

  // Decorative Corners
  // Top-Left
  doc.rect(32, 32, 15, 15).fill('#C9A227');
  // Top-Right
  doc.rect(795, 32, 15, 15).fill('#C9A227');
  // Bottom-Left
  doc.rect(32, 548, 15, 15).fill('#C9A227');
  // Bottom-Right
  doc.rect(795, 548, 15, 15).fill('#C9A227');

  // Base Heading - INTERNSPACE TECHNOLOGY COLLABORATIVE
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .fillColor('#0F172A')
     .text('INTERNSPACE FELLOWSHIP COHORT', 40, 60, { align: 'center' });

  doc.moveDown(0.5);

  // Main Ribbon Badge
  doc.fontSize(38)
     .fillColor('#C9A227')
     .text('CERTIFICATE OF COMPLETION', { align: 'center' });

  doc.moveDown(0.5);

  // Description intro helper
  doc.font('Helvetica')
     .fontSize(14)
     .fillColor('#475569')
     .text('This credential is proud to certify that', { align: 'center' });

  doc.moveDown(0.8);

  // Student Full Name
  doc.font('Helvetica-Bold')
     .fontSize(28)
     .fillColor('#0F172A')
     .text(studentName.toUpperCase(), { align: 'center' });

  // Border below student name
  doc.moveTo(250, doc.y + 4)
     .lineTo(592, doc.y + 4)
     .lineWidth(1.5)
     .stroke('#C9A227');

  doc.moveDown(1.5);

  // Context of Achievement
  doc.font('Helvetica')
     .fontSize(13)
     .fillColor('#475569')
     .text(`has successfully met all professional competencies and completed the `, { align: 'center' });

  doc.moveDown(0.4);

  doc.font('Helvetica-Bold')
     .fontSize(16)
     .fillColor('#0F172A')
     .text(programName, { align: 'center' });

  doc.moveDown(0.4);

  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  doc.font('Helvetica')
     .fontSize(12)
     .fillColor('#64748B')
     .text(`Duration: ${duration}     |     Completion Date: ${formattedDate}`, { align: 'center' });

  doc.moveDown(2);

  // Footer visual parts: QR Code, Signatures, Verification Details
  const yFooter = 420;

  // Render QR Code on the left
  if (fs.existsSync(qrPath)) {
    doc.image(qrPath, 80, yFooter, { width: 90 });
    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#94A3B8')
       .text('Scan to Verify Securely', 82, yFooter + 95, { width: 90, align: 'center' });
  }

  // Verification Details centrally at the bottom
  doc.font('Helvetica')
     .fontSize(9)
     .fillColor('#64748B')
     .text(`Certificate Identifier: ${certificateNumber}`, 250, yFooter + 25, { align: 'center', width: 342 });
  doc.fontSize(8)
     .fillColor('#94A3B8')
     .text(`Secured by cryptographic audit hash matching. Verify verification at ${appUrl || 'internspace.com'}/verify`, 250, yFooter + 42, { align: 'center', width: 342 });

  // Signature Block on the right
  doc.moveTo(600, yFooter + 50)
     .lineTo(740, yFooter + 50)
     .lineWidth(1)
     .stroke('#1E293B');

  // Script signature text
  doc.font('Times-BoldItalic')
     .fontSize(16)
     .fillColor('#1E293B')
     .text('J. Harrington', 600, yFooter + 25, { width: 140, align: 'center' });

  doc.font('Helvetica')
     .fontSize(9)
     .fillColor('#64748B')
     .text('Director of Internships', 600, yFooter + 56, { width: 140, align: 'center' });

  // Badge watermark stamp
  // Decorative golden badge
  doc.circle(705, 100, 30)
     .lineWidth(1.5)
     .stroke('#C9A227');
  doc.font('Helvetica-Bold')
     .fontSize(6)
     .fillColor('#C9A227')
     .text('OFFICIAL\nSEAL', 685, 93, { align: 'center', width: 40 });

  doc.end();

  // Return absolute paths and downloadable asset strings
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve({
        pdfPath: `/certificates/${pdfFileName}`,
        qrPath: `/qr/${qrFileName}`
      });
    });
    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}
