const express =require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/ECOM");

// user routes
const user_routes = require("./routes/userRoute");

app.use('/api',user_routes);

// store routes
const store_route = require("./routes/storeRoute");
app.use('/api',store_route);

app.listen(3000 , function(){
    console.log("Server is ready 3000");
});