import nodemailer from 'nodemailer';
import { Setting, EmailLog } from '../models/index.js';

export async function sendEmail({ to, subject, html }) {
  console.log(`[Email Service] Preparing to send email to ${to}: ${subject}`);
  
  try {
    // Attempt to load SMTP settings from DB
    const smtpHost = await Setting.findByPk('SMTP_HOST');
    const smtpPort = await Setting.findByPk('SMTP_PORT');
    const smtpUser = await Setting.findByPk('SMTP_USER');
    const smtpPass = await Setting.findByPk('SMTP_PASS');
    const siteName = await Setting.findByPk('SITE_NAME');
    
    const senderName = siteName ? siteName.value : 'InternSpace Platform';

    let sent = false;
    let errorDetails = null;

    if (smtpHost && smtpHost.value && smtpUser && smtpUser.value && smtpPass && smtpPass.value) {
      console.log(`[Email Service] SMTP configuration found. Handshaking with ${smtpHost.value}...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost.value,
        port: parseInt(smtpPort?.value || '587', 10),
        secure: parseInt(smtpPort?.value || '587', 10) === 465,
        auth: {
          user: smtpUser.value,
          pass: smtpPass.value,
        },
      });

      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser.value}>`,
        to,
        subject,
        html,
      });
      sent = true;
      console.log(`[Email Service] Success! Email sent via SMTP to ${to}`);
    } else {
      console.log(`[Email Service] SMTP is not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASS empty). Falling back to logging email output...`);
      console.log(`----------------------------------------`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${html}`);
      console.log(`----------------------------------------`);
      sent = true;
    }

    // Log the event in the database
    await EmailLog.create({
      toEmail: to,
      subject,
      status: sent ? 'Success' : 'Failed',
      errorDetails,
    });

    return { success: sent, error: errorDetails };
  } catch (error) {
    console.error(`[Email Service] Failed sending email to ${to}:`, error);
    
    await EmailLog.create({
      toEmail: to,
      subject,
      status: 'Failed',
      errorDetails: error.message || String(error),
    });

    return { success: false, error: error.message || String(error) };
  }
}
