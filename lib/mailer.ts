import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

// OTP emails are sent through the hello@bearbags.in mailbox on Titan Email.
// SMTP_HOST and SMTP_PORT default to Titan's server, so only the mailbox
// login needs to be set.
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST = 'smtp.titan.email', SMTP_PORT = '465', SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_USER and SMTP_PASS must be set — see db.md.');
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string) {
  await getTransporter().sendMail({
    from: `Bear Bags Admin <${process.env.SMTP_USER}>`,
    to,
    subject: 'Bear Bags Admin — Password Reset Code',
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  });
}
