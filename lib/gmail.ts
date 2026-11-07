import nodemailer from 'nodemailer';

// Shared sender for order emails and admin password-reset codes.
//
// Two ways to configure it; when both are set, SMTP is used and Gmail is the
// backup:
// - SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD: any mailbox, e.g. the
//   GoDaddy mailbox hello@bearbags.in (smtpout.secureserver.net, port 465).
//   In a .env file, quote the password if it contains # (it starts a comment).
// - GMAIL_USER / GMAIL_APP_PASSWORD: a Gmail account with a Google App Password
//   (Google Account → Security → 2-Step Verification → App passwords); the
//   normal Gmail password will not work.
//
// GoDaddy's server sometimes refuses a correct login, so SMTP is retried, and
// if it still fails the email goes out through Gmail instead: an order
// confirmation must not be lost to a flaky login.

interface Sender {
  user: string;
  transporter: nodemailer.Transporter;
}

let smtp: Sender | null | undefined;
let gmail: Sender | null | undefined;

function smtpSender(): Sender | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;
  const port = Number(SMTP_PORT || 465);
  return {
    user: SMTP_USER,
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 20_000,
    }),
  };
}

function gmailSender(): Sender | null {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  return {
    user: GMAIL_USER,
    // Google shows the App Password in groups of four; accept it with or without the spaces.
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s/g, '') },
    }),
  };
}

// Failures that happen before the message is handed over, so trying again
// cannot deliver it twice.
const RETRYABLE = new Set(['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS']);
const isRetryable = (error: unknown) => RETRYABLE.has((error as { code?: string })?.code ?? '');
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWithFallback(mail: nodemailer.SendMailOptions, primary: Sender | null, backup: Sender | null) {
  if (primary) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await primary.transporter.sendMail(mail);
      } catch (error) {
        lastError = error;
        if (!isRetryable(error)) throw error;
        if (attempt < 3) await sleep(2000 * attempt);
      }
    }
    if (!backup) throw lastError;
    console.warn('[mail] SMTP failed 3 times, sending through Gmail instead:', (lastError as Error)?.message);
  }
  // Gmail sends as its own account, whatever the From line says.
  return backup!.transporter.sendMail(mail);
}

/** The sending address and something to send with, or null if no mail account is configured. */
export function getGmail(): { user: string; transporter: Pick<nodemailer.Transporter, 'sendMail'> } | null {
  if (smtp === undefined) smtp = smtpSender();
  if (gmail === undefined) gmail = gmailSender();
  const first = smtp ?? gmail;
  if (!first) return null;
  const primary = smtp;
  const backup = gmail;
  return {
    user: first.user,
    transporter: { sendMail: (mail: nodemailer.SendMailOptions) => sendWithFallback(mail, primary, backup) },
  };
}
