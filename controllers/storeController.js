const Store = require("../models/storeModel");
const User = require("../models/userModel");




const create_store = async(req,res)=>{

    try {

       const userData = await User.findOne({_id:req.body.vendor_id});
       if(userData){

            if(!req.body.longitude || !req.body.latitude){
                res.status(200).send({success:false,message:"lat and long is not found "});
            }
            else{
             const vendorData = await Store.findOne({ vendor_id:req.body.vendor_id});
             if (vendorData) {
                res.status(200).send({success:false,message:"This vendor is alerady exist"});
             } else {
               const store = new Store({
                vendor_id:req.body.vendor_id,
                logo:req.file.filename,
                business_email:req.body.business_email,
                address:req.body.address,
                pin:req.body.pin,
                location:{
                    type:"Point",
                    coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]
                }
               });
              const storeData = await store.save();
              res.status(200).send({success:true,message:"Store Dayta",data:storeData});
             }
            }

       }else{
        res.status(200).send({success:false,message:"Vendor ID does not match"});
       }
        
    } catch (error) {
        res.status(400).send(error.message);
    }

}


module.exports = {
    create_store
}