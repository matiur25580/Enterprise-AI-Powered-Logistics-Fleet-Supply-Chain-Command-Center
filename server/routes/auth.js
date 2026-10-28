const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const Otp=require('../models/Otp');
const sendEmail=require('../utils/sendEmail');
const r=express.Router();

r.post('/send-otp',async(req,res)=>{
  try{
    const {email,role}=req.body;
    const exists=await User.findOne({email,role});
    if(exists) return res.status(400).json({message:'This email already registered'});
    const otp=Math.floor(100000+Math.random()*900000).toString();
    await Otp.deleteMany({email,role});
    await Otp.create({email,role,otp,expiresAt:new Date(Date.now()+5*60*1000)});
    await sendEmail(email,otp);
    res.json({message:'OTP sent to email',success:true});
  }catch(e){console.error('send-otp error:',e.message);res.status(500).json({message:e.message});}
});

r.post('/register',async(req,res)=>{
  try{
    const {fullName,email,password,role,contactNumber,dob,otp}=req.body;
    const f=await Otp.findOne({email,role,otp});
    if(!f||f.expiresAt<new Date()) return res.status(400).json({message:'Invalid or expired OTP'});
    const hash=await bcrypt.hash(password,10);
    const parts=fullName.trim().split(/\s+/);
    const first=parts[0]||'X', last=parts.length>1?parts[parts.length-1]:'X';
    const uniqueId=(role[0]+first[0]+last[0]+dob).toUpperCase();
    const user=await User.create({fullName,email,password:hash,role,contactNumber,dob,uniqueId});
    await Otp.deleteMany({email,role});
    res.json({message:'Registered successfully',success:true,uniqueId:user.uniqueId});
  }catch(e){console.error('register error:',e.message);res.status(500).json({message:e.message});}
});

r.post('/login',async(req,res)=>{
  try{
    const {email,password,role}=req.body;
    const user=await User.findOne({email,role});
    if(!user) return res.status(400).json({message:"This email doesn't exist, please register first"});
    const ok=await bcrypt.compare(password,user.password);
    if(!ok) return res.status(400).json({message:'Invalid credentials'});
    const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.json({message:'Login successful',success:true,token,role:user.role,fullName:user.fullName,email:user.email});
  }catch(e){console.error('login error:',e.message);res.status(500).json({message:e.message});}
});

r.post('/forgot-password',async(req,res)=>{
  try{
    const {email,role}=req.body;
    const user=await User.findOne({email,role});
    if(!user) return res.status(400).json({message:"This email doesn't exist"});
    const otp=Math.floor(100000+Math.random()*900000).toString();
    await Otp.deleteMany({email,role});
    await Otp.create({email,role,otp,expiresAt:new Date(Date.now()+5*60*1000)});
    await sendEmail(email,otp);
    res.json({message:'OTP sent to email',success:true});
  }catch(e){console.error('forgot error:',e.message);res.status(500).json({message:e.message});}
});

r.post('/reset-password',async(req,res)=>{
  try{
    const {email,role,otp,newPassword}=req.body;
    const f=await Otp.findOne({email,role,otp});
    if(!f||f.expiresAt<new Date()) return res.status(400).json({message:'Invalid or expired OTP'});
    const hash=await bcrypt.hash(newPassword,10);
    await User.findOneAndUpdate({email,role},{password:hash});
    await Otp.deleteMany({email,role});
    res.json({message:'Password reset successfully',success:true});
  }catch(e){console.error('reset error:',e.message);res.status(500).json({message:e.message});}
});

r.get('/by-role/:role',async(req,res)=>{try{res.json(await User.find({role:req.params.role}).select('fullName email role'));}catch(e){res.status(500).json({message:e.message});}});
module.exports=r;
