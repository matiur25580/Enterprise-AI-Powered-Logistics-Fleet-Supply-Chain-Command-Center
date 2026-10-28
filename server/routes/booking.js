const express=require('express');const PDFDocument=require('pdfkit');const Booking=require('../models/Booking');const r=express.Router();
r.post('/create',async(req,res)=>{try{
  const invoiceNo='INV'+Date.now();
  const b=await Booking.create({...req.body,invoiceNo});
  res.json({message:'Booking created successfully',success:true,b});
}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{res.json(await Booking.find().sort({createdAt:-1}));});
r.get('/invoice/:id',async(req,res)=>{
  const b=await Booking.findById(req.params.id);if(!b)return res.status(404).send('Not found');
  const doc=new PDFDocument();res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename=${b.invoiceNo}.pdf`);
  doc.pipe(res);doc.fontSize(20).text('Logistics Invoice',100,100);doc.fontSize(12).text(`Invoice No: ${b.invoiceNo}`,100,140);doc.text(`Client: ${b.clientName}`,100,160);doc.text(`From: ${b.from} To: ${b.to}`,100,180);doc.text(`Goods: ${b.goods} Weight: ${b.weight}`,100,200);doc.text(`Status: ${b.status}`,100,220);doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`,100,240);doc.end();
});
r.put('/status/:id',async(req,res)=>{try{await Booking.findByIdAndUpdate(req.params.id,{status:req.body.status});res.json({message:'Booking status updated successfully',success:true});}catch(e){res.status(500).json({message:e.message});}});
module.exports=r;
