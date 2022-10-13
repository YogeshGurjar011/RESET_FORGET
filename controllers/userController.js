const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const randomstring = require("randomstring")

// this is the option to send the mail i reset the password
const sendResetPasswordMail = async (name, email, token) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p> Hii ' + name + ',please copy the link and <a href="http://localhost:3000/api/reset-password?token=' + token + '"> reset your password</a></p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("mail has been send:- ", info.response);
            }
        })

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

// create token
const create_token = async (id, name, email) => {
    try {
        const token = await jwt.sign({ _id: id, name: name, email: email }, config.secret_jwt);
        return token
    } catch (error) {
        res.status(404).send(error.message);
    }
}


//password hashing 
const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// register api
const register_user = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            mobile: req.body.mobile,
            image: req.file.filename,
            type: req.body.type,
        });

        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            res.status(400).send({ success: false, message: "this email is already exists" });
        } else {
            const user_data = await user.save();
            res.status(201).send({ success: true, data: user_data });
        }

    } catch (error) {
        res.status(400).send(error.message);

    }
}

// login method
const user_login = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        // chech the data in database this is exist or not
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcryptjs.compare(password, userData.password);
            if (passwordMatch) {
                const tokenData = await create_token(userData._id, userData.name, userData.email);
                const userResult = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    image: userData.image,
                    mobile: userData.mobile,
                    type: userData.type,
                    token: tokenData
                }
                const response = {
                    success: true,
                    message: "User Details",
                    data: userResult
                }
                res.status(200).send(response);
            } else {
                res.status(200).send({ success: false, message: "Login detail are incorrect" });
            }
        }
        else {
            res.status(200).send({ success: false, message: "Login detail are incorrect" });
        }

    } catch (error) {
        res.status(404).send(error.message);
    }
}

// update password method
const update_password = async (req, res) => {
    try {
        // const user_id = req.body.user_id;
        const email = req.body.email;
        const password = req.body.password;
        const data = await User.findOne({ email: email });//_id: user_id
        if (data) {
            //this is password hashing
            const newPassword = await securePassword(password);
            const userData = await User.findOneAndUpdate({ email: email }, { // _id: user_id
                $set: {
                    password: newPassword
                }
            });
            res.status(200).send({ success: true, message: "Your Password has been updated ", data: userData });

        } else {
            res.status(200).send({ success: false, message: "User Id not Found" });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
}

// forget-password method
const forget_password = async (req, res) => {

    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            const data = await User.updateOne({ email: email }, { $set: { token: randomString } })
            sendResetPasswordMail(userData.name, userData.email, randomString);
            res.status(200).send({ success: true, message: "Please Check your inbox of mail and reset your password" })
        } else {
            res.status(200).send({ success: true, message: "This email does not exists" });
        }

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }

}

// reset password method
const reset_password = async(req,res)=>{
    try {

        const token = req.query.token;
      const tokenData = await User.findOne({token:token});
      if(tokenData){
        const password = req.body.password;
        const newPassword =await securePassword(password);
      const userData = await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:newPassword,token:''}},{new:true});
         res.status(200).send({success:true,message:"User Password has been reset",data:userData});

      }else{
        res.status(200).send({success:true,message:"This Link nas been expired"});
      }
        
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

// export 
module.exports = {
    register_user,
    user_login,
    update_password,
    forget_password,
    reset_password
}