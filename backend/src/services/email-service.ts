import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { config } from "../config/config";

const EMAIL_ENABLED = config.EMAIL_ENABLED === "true";
const SMTP_HOST = config.SMTP_HOST;
const SMTP_PORT = parseInt(config.SMTP_PORT);
const SMTP_SECURE = config.SMTP_SECURE === "true";
const SMTP_USER = config.SMTP_USER;
const SMTP_PASS = config.SMTP_PASS;
const SMTP_FROM = config.SMTP_FROM;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface TemplateContext {
  [key: string]: string;
}

async function renderTemplate(
  templatePath: string,
  context: TemplateContext,
): Promise<string | null> {
  try {
    const source = await fs.readFile(templatePath, "utf-8");
    const template = handlebars.compile(source);
    return template(context);
  } catch (error) {
    console.error("Error rendering template:", error);
    return null;
  }
}

async function sendEmail(
  to: string,
  subject: string,
  templatePath: string,
  context: TemplateContext,
): Promise<void> {
  if (!EMAIL_ENABLED) {
    console.log("Email sending is disabled.");
    return;
  }

  const html = await renderTemplate(templatePath, context);

  if (!html) {
    console.error("Email template rendering failed.");
    return;
  }

  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendVerificationEmail(
  to: string,
  username: string,
  verificationCode: string,
  expiryTime: string,
): Promise<void> {
  const templatePath = path.join(
    __dirname,
    "..",
    "..",
    "templates",
    "verificationEmail.hbs",
  );

  const context = {
    username,
    verificationCode,
    expiryTime,
  };

  await sendEmail(to, "Verify Your Email", templatePath, context);
}

export async function sendResetPasswordVerificationEmail(
  to: string,
  username: string,
  resetPasswordVerificationToken: string,
  expiryTime: string,
) {
  const templatePath = path.join(
    __dirname,
    "..",
    "..",
    "templates",
    "resetPasswordVerificationEmail.hbs",
  );

  let resetPasswordLink = "";

  if (config.NODE_ENV === "development") {
    resetPasswordLink = `${config.CLIENT_DEV_URL}/reset-password/${to}/${resetPasswordVerificationToken}`;
  } else {
    resetPasswordLink = `${config.CLIENT_PROD_URL}/reset-password/${to}/${resetPasswordVerificationToken}`;
  }

  const context = {
    username,
    resetPasswordVerificationToken,
    expiryTime,
    resetPasswordLink,
  };

  await sendEmail(to, "Reset Your Password", templatePath, context);
}
