const express=require('express');const Trip=require('../models/Trip');const r=express.Router();
r.post('/create',async(req,res)=>{try{const t=await Trip.create(req.body);res.json({message:'Trip created successfully',success:true,t});}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{const t=await Trip.find().populate('vehicle driver');res.json(t);});
r.put('/status/:id',async(req,res)=>{await Trip.findByIdAndUpdate(req.params.id,{status:req.body.status});res.json({message:'Trip status updated successfully',success:true});});
r.delete('/:id',async(req,res)=>{try{await Trip.findByIdAndDelete(req.params.id);res.json({message:'Trip deleted successfully',success:true});}catch(e){res.status(500).json({message:e.message});}});
module.exports=r;
