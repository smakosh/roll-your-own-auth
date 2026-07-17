import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMagicLink(
  email: string,
  token: string,
): Promise<void> {
  const frontendUrl = String(
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  );
  const link = `${frontendUrl}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your magic link",
    html: `<p>Click <a href="${link}">here</a> to log in. This link expires in 15 minutes.</p>`,
  });
}
