import connectDB from '../../../utils/connectDB'
import User from '../../../models/userModel'
import auth from '../../../middleware/auth'
import bcrypt from 'bcrypt'
const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



connectDB()

export default async(req, res) => {
    switch (req.method) {
        case "PATCH":
            await resetPassword(req, res)
            break;
    }
}


const resetPassword = async(req, res) => {
    try {
        const result = await auth(req, res)
        const { password } = req.body
        const passwordHash = await bcrypt.hash(password, 12)

        await User.findOneAndUpdate({ _id: result.id }, { password: passwordHash })

        res.json({ msg: "Update Success!" })

    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "vanhieu981981@gmail.com",
        pass: "jkuspqiqdmzuvrkh"
    }
});


// Forgot password - Step 1: email submission
app.post('/forgot-password', async(req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        // Generate password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in an hour
        await user.save();

        // Construct email message
        const mailOptions = {
            to: user.email,
            from: "vanhieu981981@gmail.com",
            subject: 'Password reset link',
            text: `Click on this link to reset your password: http://localhost:3000/reset-password?token=${resetToken}`
        }

        // Send email
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                res.status(500).send('Could not send reset link');
            } else {
                console.log(info);
                res.send('Reset link sent');
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Could not process request');
    }
});

// Reset password - Step 2: password submission
app.post('/reset-password', async(req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            res.status(400).send('Invalid or expired token');
        } else {
            user.password = bcrypt.hashSync(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.send('Password reset successful');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Could not process request');
    }
});