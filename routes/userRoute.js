const express = require("express");
const user_route = express();

const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");


user_route.use(express.static('public'));
// store the image
 const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'),function(error,success){
            if(error) throw error
        });
    },
    //filename in save to database
    filename:function(req,file,cb){
       const name =  Date.now()+'-'+file.originalname;
       cb(null , name ,function(error1, success1){
        if(error1) throw error1
       })
    }
});

const upload = multer({storage:storage});

//post register api
const user_controller = require("../controllers/userController");

const auth = require("../middleware/auth");

user_route.post('/register',upload.single('image'),user_controller.register_user);

//login post api
user_route.post('/login',user_controller.user_login);

//testing the api for aurthenticate
user_route.get('/test',auth,function(req,res){
    res.status(200).send({success:true,message:" Authenticated"})
})

// update password route
user_route.post('/update-password',auth,user_controller.update_password);

// forgot password route
user_route.post('/forget-password',user_controller.forget_password);

//
user_route.get('/reset-password' , user_controller.reset_password);
module.exports = user_route;