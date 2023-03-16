import connectDB from '../../../utils/connectDB'
import Orders from '../../../models/orderModel'
import Products from '../../../models/productModel'
import user from '../../../models/userModel'
import auth from '../../../middleware/auth'
import nodemailer from 'nodemailer'
const mongoose = require("mongoose");

connectDB()

export default async(req, res) => {
    switch (req.method) {
        case "POST":
            await createOrder(req, res)
            break;
        case "GET":
            await getOrders(req, res)
            break;
    }
}



const getOrders = async(req, res) => {
    try {
        const result = await auth(req, res)

        let orders;
        if (result.role !== 'admin') {
            orders = await Orders.find({ user: result.id }).populate("user", "-password")
        } else {
            orders = await Orders.find().populate("user", "-password")
        }

        res.json({ orders })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}


const createOrder = async(req, res) => {
    try {
        const result = await auth(req, res)
        const { address, mobile, cart, total } = req.body

        const newOrder = new Orders({
            user: result.id,
            address,
            mobile,
            cart,
            total

        })

        cart.filter(item => {
            return sold(item._id, item.quantity, item.inStock, item.sold)
        })

        await newOrder.save();
        const userID = mongoose.Types.ObjectId(result.id);
        Orders.findById(userID, function(err, order) {
            user.findById(userID, function(err, user) {

                console.log("User's email: " + user.email);
                console.log("order: " + order.delivered);


                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "hoavangtrencoxanh981@gmail.com",
                        pass: "bytakwywycvcglvy"
                    }
                });
                const mailOptions = {
                    from: "hoavangtrencoxanh981@gmail.com",
                    to: user.email,
                    subject: "Xác thực địa chỉ email",
                    text: `Xác thực địa chỉ email`,
                    //html: `<p>Mã xác thực của bạn là: <strong>${verifyCode}</strong></p>`
                    html: `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Cám ơn bạn đã đặt hàng tại NHÀ SÁCH ĐÔNG NAM Á .</h2>
            <p>Xin chào ${user.name},\n
            Shop đã nhận được yêu cầu đặt hàng của bạn và đang xử lý nhé. \n   
            </p>
            <p>Đơn hàng được giao đến</p>
            <p>Tên :         ${user.name}</p> 
            <p>Địa chỉ nhà:  ${req.body.address}</p>
            <p>Điện thoại: : ${req.body.mobile}</p> 
            <p>Email:        ${user.email}</p>
            <p>Kiện hàng</p>
            <p>Tên sản phẩm: ${user.email}</p>
            <p>Tổng tiền:    ${req.body.total}</p>
           
            `
                };
                const result_ = transporter.sendMail(mailOptions);
            });
        });
        res.json({
            msg: 'Order success! We will contact you to confirm the order.',
            newOrder
        })

    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

const sold = async(id, quantity, oldInStock, oldSold) => {
    await Products.findOneAndUpdate({ _id: id }, {
        inStock: oldInStock - quantity,
        sold: quantity + oldSold
    })
}