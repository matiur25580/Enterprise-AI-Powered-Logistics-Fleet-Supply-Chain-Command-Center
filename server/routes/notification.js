const r = require('express').Router();
const Notification = require('../models/Notification');
const {authorize}=require('../middleware/auth');
r.get('/my',async(req,res)=>{res.json(await Notification.find({to:req.user.email}).sort({createdAt:-1}).limit(60));});
r.put('/read-all',async(req,res)=>{await Notification.updateMany({to:req.user.email},{read:true});res.json({msg:'ok'});});
r.put('/:id/read',async(req,res)=>{const result=await Notification.updateOne({_id:req.params.id,to:req.user.email},{$set:{read:true}});if(!result.matchedCount)return res.status(404).json({msg:'Notification not found'});res.json({msg:'ok'});});
r.post('/',authorize('Admin','FleetManager'),async(req,res)=>{res.json(await Notification.create(req.body));});
module.exports = r;
