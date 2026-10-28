const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const Otp=require('../models/Otp');
const sendEmail=require('../utils/sendEmail');
const router=express.Router();
const genId=(role,name,dob)=>{const r=role[0].toUpperCase();const parts=name.trim().split(' ');const n=parts[0][0].toUpperCase();const s=(parts[1]?.[0]||'X').toUpperCase();return `${r}${n}${s}${dob.replace(/\D/g,'')}`;};
router.post('/send-otp',async(req,res)=>{
  try{const{email}=req.body;const otp=Math.floor(100000+Math.random()*900000).toString();
  await Otp.deleteMany({email});
  await Otp.create({email,otp,expiresAt:new Date(Date.now()+5*60*1000)});
  await sendEmail(email,otp); res.json({message:'OTP sent',success:true});
  }catch(e){res.status(500).json({message:e.message});}
});
router.post('/register',async(req,res)=>{
  try{const{fullName,email,password,role,contactNumber,dob,otp}=req.body;
  const found=await Otp.findOne({email,otp});
  if(!found||found.expiresAt<new Date()) return res.status(400).json({message:'Invalid or expired OTP'});
  const exists=await User.findOne({email});
  if(exists) return res.status(400).json({message:'This email already registered'});
  const hash=await bcrypt.hash(password,10);
  const uniqueId=genId(role,fullName,dob||'01012000');
  const user=await User.create({fullName,email,password:hash,role,contactNumber,dob,uniqueId});
  await Otp.deleteMany({email});
  res.json({message:'Registered successfully',success:true,uniqueId:user.uniqueId});
  }catch(e){res.status(500).json({message:e.message});}
});
router.post('/login',async(req,res)=>{
  try{const{email,password,role}=req.body;
  const user=await User.findOne({email,role});
  if(!user) return res.status(400).json({message:"This email doesn't exist, plz register first"});
  const ok=await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({message:'Invalid credentials'});
  const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.json({message:'Login successful',success:true,token,role:user.role,fullName:user.fullName});
  }catch(e){res.status(500).json({message:e.message});}
});
module.exports=router;
