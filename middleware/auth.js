const jwt = require("jsonwebtoken");
const config = require("../config/config");

const verifyToken = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["authorization"]; //req.headers.authorization.split(" ")[1];

    if (!token) {
        res.status(200).send({ success: false, message: "A token is required for authentication." })
    }
    try {

        const descode = jwt.verify(token, config.secret_jwt);
        req.user = descode;
    } catch (error) {
        res.status(400).send("Invalid Token")
    }
    return next();

}


module.exports = verifyToken;
// const jwt = require("jsonwebtoken");
// const config = require("../config/config");

// const verifyToken = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         // console.log(token);
//         const verify = jwt.verify(token, config.secret_jwt)
//         // console.log(verify)
//         if (!verify) {
//             return res.status(401).json({
//                 message: "please provide valid token"
//             })
//         }
//         else {
//             next();
//         }

//     }
//     catch (error) {
//         return res.status(401).json({
//             message: "invalid token"
//         })
//     }
// }

// module.exports = verifyToken;