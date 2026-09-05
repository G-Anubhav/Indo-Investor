import nodemailer from "nodemailer";

const attempts = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character]);
}

function isRateLimited(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const address = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const recent = (attempts.get(address) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
    recent.push(now);
    attempts.set(address, recent);
    return recent.length > MAX_REQUESTS;
}

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method not allowed." });
    }

    if (isRateLimited(req)) {
        return res.status(429).json({ success: false, error: "Too many requests. Please try again shortly." });
    }

    const firstName = cleanText(req.body?.firstName, 80);
    const lastName = cleanText(req.body?.lastName, 80);
    const phone = cleanText(req.body?.phone, 30);
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const message = cleanText(req.body?.message, 2_000);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!firstName || !phone || !validEmail || !message) {
        return res.status(400).json({ success: false, error: "Please provide valid contact details." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.CONTACT_RECIPIENT_EMAIL) {
        return res.status(503).json({ success: false, error: "Contact service is temporarily unavailable." });
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"Indo Investor Infra World Website" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECIPIENT_EMAIL,
        subject: `New Lead from Website Indoinvestorinfraworld.com`,
        html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Message:</strong> ${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch {
        console.error("Contact email delivery failed.");
        res.status(502).json({ success: false, error: "Message delivery failed. Please try again later." });
    }
}

export const config = {
    api: { bodyParser: { sizeLimit: "16kb" } },
};
