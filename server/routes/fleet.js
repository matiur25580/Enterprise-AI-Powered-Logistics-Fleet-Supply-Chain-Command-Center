const express=require('express');const Vehicle=require('../models/Vehicle');const r=express.Router();
r.post('/add',async(req,res)=>{try{const v=await Vehicle.create(req.body);res.json({message:'Vehicle added successfully',success:true,v});}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{const v=await Vehicle.find().populate('driver','fullName');res.json(v);});
r.put('/status/:id',async(req,res)=>{await Vehicle.findByIdAndUpdate(req.params.id,{status:req.body.status});res.json({message:'Status updated successfully',success:true});});
r.delete('/:id',async(req,res)=>{await Vehicle.findByIdAndDelete(req.params.id);res.json({message:'Vehicle deleted successfully',success:true});});
module.exports=r;
