const express=require('express');const Warehouse=require('../models/Warehouse');const r=express.Router();
r.post('/add',async(req,res)=>{try{const w=await Warehouse.create(req.body);res.json({message:'Warehouse added successfully',success:true,w});}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{const w=await Warehouse.find().populate('manager','fullName');res.json(w);});
module.exports=r;
