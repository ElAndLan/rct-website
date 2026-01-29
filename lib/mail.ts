import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("RESEND_API_KEY is missing. Email logging enabled:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    // console.log(`Body: ${html}`);
    return { success: false, error: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Theatre Admin <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
