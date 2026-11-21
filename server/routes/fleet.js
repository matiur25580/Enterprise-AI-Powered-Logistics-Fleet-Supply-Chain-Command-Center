const express=require('express');const Vehicle=require('../models/Vehicle');const {authorize}=require('../middleware/auth');const r=express.Router();
r.post('/add',authorize('Admin','FleetManager'),async(req,res)=>{try{const v=await Vehicle.create(req.body);res.json({message:'Vehicle added successfully',success:true,v});}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',authorize('Admin','FleetManager','Driver'),async(req,res)=>{const v=await Vehicle.find().populate('driver','fullName');res.json(v);});
r.put('/status/:id',authorize('Admin','FleetManager'),async(req,res)=>{const v=await Vehicle.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true,runValidators:true});if(!v)return res.status(404).json({message:'Vehicle not found'});res.json({message:'Status updated successfully',success:true});});
r.delete('/:id',authorize('Admin','FleetManager'),async(req,res)=>{const v=await Vehicle.findByIdAndDelete(req.params.id);if(!v)return res.status(404).json({message:'Vehicle not found'});res.json({message:'Vehicle deleted successfully',success:true});});
module.exports=r;
