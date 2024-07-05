const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require("cors")

dotenv.config();
const prisma = new PrismaClient();
const app = express();

/* Middleware */
app.use(express.json());
app.use(cors())

/* Post route */
app.post('/api/referrals', async (req, res) => {
    const { name, email, friendName, friendEmail, message } = req.body;

    if (!name || !email || !friendName || !friendEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const referral = await prisma.referral.create({
            data: {
                name,
                email,
                friendName,
                friendEmail,
                message,
            },
        })
        res.status(200).json(referral);

        /* Send referral email using nodemailer */
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
            port: 587, // Port for SMTP (usually 465)
            secure: false, // Usually true if connecting to port 465
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Password (for gmail, your app password)
            },
        });
        const mailOptions = {
            from: {
                name: "Mohit",
                address: process.env.EMAIL_USER,
            },
            to: friendEmail,
            subject: 'You have been referred!',
            text: `Hi ${friendName},\n\n${name} has referred you to check out our courses.\n\nMessage: ${message}\n\nBest regards,\nYour Company`,
        }
        const sendMail = async (transporter, mailOptions) => {
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email is sent")
            } catch (error) {
                console.log(error)
            }
        }
        await sendMail(transporter, mailOptions)
    } catch (error) {
        res.status(500).json({ error: 'Error creating referral' });
        console.log(error)
    }
});

app.listen(process.env.PORT, () => {
    console.log('Server is running on port:', process.env.PORT);
});
