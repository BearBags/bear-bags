import nodemailer from 'nodemailer';

// Shared Gmail sender for order notifications and admin password-reset codes.
// Uses a Google App Password (Google Account → Security → 2-Step Verification →
// App passwords) -- the normal Gmail password will not work.
let transporter: nodemailer.Transporter | null = null;

/** The sending Gmail account and its transport, or null if not configured. */
export function getGmail(): { user: string; transporter: nodemailer.Transporter } | null {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;

  // Google shows the App Password in groups of four; accept it with or without the spaces.
  transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s/g, '') },
  });
  return { user: GMAIL_USER, transporter };
}
