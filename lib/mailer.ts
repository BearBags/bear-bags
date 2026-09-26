import { dataRouting } from '@/config/data-routing';
import { getGmail } from './gmail';

// Sends an admin password-reset code to the fixed recovery address.
export async function sendOtpEmail(otp: string) {
  const gmail = getGmail();
  if (!gmail) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be set to send reset codes.');
  }

  await gmail.transporter.sendMail({
    from: `Bear Bags Admin <${gmail.user}>`,
    to: dataRouting.admin.recoveryEmail,
    subject: 'Bear Bags Admin — Password Reset Code',
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  });
}
