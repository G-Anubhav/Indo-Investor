import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { firstName, lastName, phone, email, message } = req.body;

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
        to: "info@indoinvestorinfraworld.com", // Where leads are received
        subject: `New Lead from Website Indoinvestorinfraworld.com`,
        html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Email sending error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
