import { sendEmail, FROM_ADDRESS } from '../config/mailer';

async function sendApplicationConfirmation(data: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: `Application received — ${data.jobTitle}`,
    html: `
      <h2>Application Received</h2>
      <p>Hi ${data.applicantName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.</p>
      <p>We'll notify you when your application status changes.</p>
    `,
  });
}

async function sendStatusUpdate(data: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: `Application update — ${data.jobTitle}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Hi ${data.applicantName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been updated.</p>
      <p>New status: <strong>${data.status.replace('_', ' ')}</strong></p>
    `,
  });
}

async function sendJobAlert(data: {
  to: string;
  userName: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  jobType: string;
  jobId: number;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: `New job match — ${data.jobTitle}`,
    html: `
      <h2>New Job Alert</h2>
      <p>Hi ${data.userName},</p>
      <p>A new job matching your alert has been posted:</p>
      <p>
        <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong><br/>
        ${data.location ? `Location: ${data.location}<br/>` : ''}
        Type: ${data.jobType.replace('_', ' ')}
      </p>
      <p>Log in to view the full listing and apply.</p>
    `,
  });
}

async function sendCompanyNewJob(data: {
  to: string;
  userName: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  jobType: string;
  jobId: number;
}): Promise<void> {
  await sendEmail({
    to: data.to,
    subject: `${data.companyName} just posted a new job`,
    html: `
      <h2>New Job from ${data.companyName}</h2>
      <p>Hi ${data.userName},</p>
      <p>A company you follow has posted a new job:</p>
      <p>
        <strong>${data.jobTitle}</strong><br/>
        ${data.location ? `Location: ${data.location}<br/>` : ''}
        Type: ${data.jobType.replace('_', ' ')}
      </p>
      <p>Log in to view the full listing and apply.</p>
    `,
  });
}

export { sendApplicationConfirmation, sendStatusUpdate, sendJobAlert, sendCompanyNewJob };
