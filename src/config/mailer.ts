import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';

export const FROM_ADDRESS =
  process.env.SMTP_FROM ?? 'Job Board <onboarding@resend.dev>';

let resendClient: Resend | null = null;
let devTransporter: Transporter | null = null;

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    if (!resendClient) {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    const { error } = await resendClient.emails.send({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (error) throw new Error(error.message);
  } else {
    if (!devTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`[Mailer] Ethereal user: ${testAccount.user}`);
      devTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }
    const info = await devTransporter.sendMail({
      from: FROM_ADDRESS,
      ...options,
    });
    console.log(`[Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
