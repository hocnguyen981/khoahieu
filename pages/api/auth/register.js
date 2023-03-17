import connectDB from '../../../utils/connectDB'
import Users from '../../../models/userModel'
import valid from '../../../utils/valid'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'


connectDB()

export default async(req, res) => {
    switch (req.method) {
        case "POST":
            await register(req, res)
            break;
    }
}

const register = async(req, res) => {
    try {
        const { name, email, password, cf_password } = req.body

        const errMsg = valid(name, email, password, cf_password)
        if (errMsg) return res.status(400).json({ err: errMsg })

        const user = await Users.findOne({ email })
        if (user) return res.status(400).json({ err: 'This email already exists.' })

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = new Users({
            name,
            email,
            password: passwordHash,
            cf_password
        })

        await newUser.save()
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "vanhieu981981@gmail.com",
                pass: "jkuspqiqdmzuvrkh"
            }
        });
        const mailOptions = {
            from: "vanhieu981981@gmail.com",
            to: req.body.email,
            subject: "Xác thực địa chỉ email",
            text: `Xác thực địa chỉ email`,
            //html: `<p>Mã xác thực của bạn là: <strong>${verifyCode}</strong></p>`
            html: `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Chào mừng bạn đến với NHÀ SÁCH ĐÔNG NAM Á.</h2>
            <p>Chúc mừng bạn! Bạn sẽ bắt bắt đầu sử dụng  Website  NHÀ SÁCH ĐÔNG NAM Á
                Hãy nhấp vào nút bên dưới để xác thực địa chỉ email của bạn
            </p>
      <p>Click <a href="http://localhost:3000/signin/" style="background: crimson; 
      text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">ở đây</a> để xác thực email</p>`
        };
        const result = await transporter.sendMail(mailOptions);
        //res.status(400).send({ message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản.' });

        res.json({ msg: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản." })

    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}