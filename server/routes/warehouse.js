const express=require('express');const Warehouse=require('../models/Warehouse');const r=express.Router();
r.post('/add',async(req,res)=>{try{const w=await Warehouse.create(req.body);res.json({message:'Warehouse added successfully',success:true,w});}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{const w=await Warehouse.find().populate('manager','fullName');res.json(w);});
r.put('/stock/:id',async(req,res)=>{try{
  const w=await Warehouse.findById(req.params.id);if(!w)return res.status(404).json({message:'Warehouse not found'});
  const u=Number(req.body.usedCapacity);
  if(isNaN(u)||u<0||u>(w.totalCapacity||0))return res.status(400).json({message:'Stock must be between 0 and total capacity ('+w.totalCapacity+')'});
  w.usedCapacity=u;await w.save();
  res.json({message:'Stock updated successfully',success:true});
}catch(e){res.status(500).json({message:e.message});}});
module.exports=r;
