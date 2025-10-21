import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import nodemailer from 'nodemailer';
import OTP from '../models/otp.js';
import e from 'express';

export async function createUser(request, response) {
    if (request.body.role == "admin") {
        if (request.user != null) {
            if (request.user.role !== 'admin') {
                response.status(403).json({
                    message: 'you are not authorized to create an admin user'
                });
                return;
            }

        } else {
            response.status(403).json({
                message: 'you are not authorized to create an admin user'
            });
            return;
        }
    }

    const hashedPassword = bcrypt.hashSync(request.body.password, 10);

    const user = new User({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        password: hashedPassword,
        email: request.body.email,
        role: request.body.role,
    });

    await user.save()
        .then(() => {
            response.json({
                message: 'User created successfully',
                user: user
            });
        })
        .catch((error) => {
            console.error('Error creating user:', error);

            response.status(500).json({
                message: 'Error creating user',
                error: error
            });
        });
}
export function loginUser(request, response) {
    const email = request.body.email;
    const password = request.body.password;

    User.findOne({ email: email })
        .then((user) => {
            if (user == null) {
                response.status(404).json({
                    message: 'User not found'
                })
            }
            else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                if (isPasswordCorrect) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            img: user.img
                        },
                        process.env.JWT_SECRET
                    )
                    response.json({
                        message: 'Login successful',
                        token: token,
                        role: user.role
                    })
                }
                else {
                    response.status(401).json({
                        message: 'Invalid password'
                    })
                }
            }
        }
        )
}

export async function loginwithGoogle(request, response) {
    const token = request.body.accessToken;
    if (token == null) {
        response.status(400).json({
            message: 'Access token is required'
        });
        return;
    }
    const res = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    console.log(res.data);

    const user = await User.findOne({ email: res.data.email });
    if (user == null) {
        const newUser = new User({
            firstName: res.data.given_name,
            lastName: res.data.family_name,
            password: "googleuser",
            email: res.data.email,
            role: "user",
            img: res.data.picture,
        });
        await newUser.save();
        const jwtToken = jwt.sign(
            {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                img: newUser.img
            },
            process.env.JWT_SECRET
        );
        response.json({
            message: 'Login successful',
            token: jwtToken,
            role: newUser.role
        });

    }
    else {
        const jwtToken = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                img: user.img
            },
            process.env.JWT_SECRET
        );
        response.json({
            message: 'Login successful',
            token: jwtToken,
            role: user.role
        });

    }

}
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // Use STARTTLS
    secure: false, // false for port 587
    requireTLS: true,
    auth: {
        user: "thejantharindu@gmail.com",
        pass: "sqgvpmdcjtjxegvd",
    },
    tls: {
        // 👇 This line ignores self-signed certificate errors
        rejectUnauthorized: false,
    },
});

transporter.verify()
    .then(() => console.log("✅ SMTP transporter verified successfully"))
    .catch((err) => console.error("❌ SMTP transporter verification failed:", err.message));

export async function sendOTP(req, res) {
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email });
    if (user == null) {
        return res.status(404).json({ message: 'User not found' });
    }
    //delete all previous OTPs for this email
    await OTP.deleteMany({
        email: email
    });

    // const message = {
    //     from: "thejantharindu@gmail.com",
    //     to: email,
    //     subject: "Your OTP Code",
    //     text: "Your OTP code is : " + randomOTP
    // };


    const message = {
        from: "thejantharindu@gmail.com",
        to: email,
        subject: "🔐 Your Secure OTP Code",
        html: `
    <div style="
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 30px;
      text-align: center;
    ">
      <div style="
        background-color: #ffffff;
        max-width: 500px;
        margin: auto;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #4A90E2;">Your One-Time Password (OTP)</h2>
        <p style="color: #333; font-size: 16px;">
          Use the following code to verify your account:
        </p>
        <h1 style="
          background: #4A90E2;
          color: white;
          display: inline-block;
          padding: 12px 24px;
          border-radius: 8px;
          letter-spacing: 3px;
          font-size: 28px;
        ">
          ${randomOTP}
        </h1>
        <p style="color: #555; font-size: 14px; margin-top: 20px;">
          This code will expire in <b>5 minutes</b>. Please do not share it with anyone.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Tharindu Thejan — All rights reserved.
        </p>
      </div>
    </div>
  `,
    };

    const otp = new OTP({
        email: email,
        otp: randomOTP
    });

    await otp.save();

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error('sendOTP error:', error);
            return res.status(500).json({
                message: 'Error sending email',
                ...(process.env.NODE_ENV !== 'production' && { error: error?.message || String(error) })
            });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
    });
}

export async function resetPassword(req, res) {
    const otp = req.body.otp;
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    const response = await OTP.findOne({
        email: email,
    });
    if (response == null) {
        return res.status(500).json({
            message: 'Invalid OTP or email'
        });
    }
    if (otp == response.otp) {
        await OTP.deleteMany({
            email: email
        });
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const response2 = await User.updateOne({
            email: email
        }, {
            password: hashedPassword
        }
        );
        res.status(200).json({ message: 'Password reset successfully' });

    } else {
        return res.status(403).json({
            message: 'Invalid OTP or email'
        });

    }
}

export function getUser(request, response) {
    if (request.user == null) {
        response.status(401).json({
            message: 'You are not logged in'
        });
        return;
    } else {
        response.json({
            ...request.user
        });
    }
}



export function isAdmin(request) {
    if (request.user == null) {
        return false;
    }
    if (request.user.role !== 'admin') {
        return false;
    } else {
        return true;
    }
}
