import nodemailer from 'nodemailer';
import { getTransporter } from '../config/mailer';

async function sendApplicationConfirmation(data: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
}): Promise<void> {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"Job Board" <noreply@jobboard.com>',
    to: data.to,
    subject: `Application received — ${data.jobTitle}`,
    html: `
      <h2>Application Received</h2>
      <p>Hi ${data.applicantName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.</p>
      <p>We'll notify you when your application status changes.</p>
    `,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

async function sendStatusUpdate(data: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
}): Promise<void> {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"Job Board" <noreply@jobboard.com>',
    to: data.to,
    subject: `Application update — ${data.jobTitle}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Hi ${data.applicantName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been updated.</p>
      <p>New status: <strong>${data.status.replace('_', ' ')}</strong></p>
    `,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

export { sendApplicationConfirmation, sendStatusUpdate };
