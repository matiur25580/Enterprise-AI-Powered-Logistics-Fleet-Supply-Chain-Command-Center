const express=require('express');const PDFDocument=require('pdfkit');const Booking=require('../models/Booking');const r=express.Router();
const {sendMail}=require('../utils/mailer');
r.post('/create',async(req,res)=>{try{
  const invoiceNo='INV'+Date.now();
  const b=await Booking.create({...req.body,invoiceNo});
  if(req.body.email){sendMail(req.body.email,'Booking Received - '+b.invoiceNo,
      '<h2>FleetCommand</h2><p>Hi '+(b.clientName||'Customer')+',</p><p>Your shipment booking has been received.</p><p><b>Invoice:</b> '+b.invoiceNo+'<br><b>Route:</b> '+b.from+' to '+b.to+'<br><b>Goods:</b> '+(b.goods||'-')+' | <b>Weight:</b> '+(b.weight||'-')+'</p><p>You will be notified on delivery.</p>').catch(function(){});}
  res.json({message:'Booking created successfully',success:true,b});
}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',async(req,res)=>{res.json(await Booking.find().sort({createdAt:-1}));});
r.get('/invoice/:id',async(req,res)=>{
  const b=await Booking.findById(req.params.id);if(!b)return res.status(404).send('Not found');
  const doc=new PDFDocument();res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename=${b.invoiceNo}.pdf`);
  doc.pipe(res);doc.fontSize(20).text('Logistics Invoice',100,100);doc.fontSize(12).text(`Invoice No: ${b.invoiceNo}`,100,140);doc.text(`Client: ${b.clientName}`,100,160);doc.text(`From: ${b.from} To: ${b.to}`,100,180);doc.text(`Goods: ${b.goods} Weight: ${b.weight}`,100,200);doc.text(`Status: ${b.status}`,100,220);doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`,100,240);doc.end();
});
r.put('/status/:id',async(req,res)=>{try{
    const b=await Booking.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});
    if(b&&req.body.status==='Delivered'&&b.email){sendMail(b.email,'Shipment Delivered - '+b.invoiceNo,
      '<h2>FleetCommand</h2><p>Hi '+(b.clientName||'Customer')+',</p><p>Your shipment <b>'+b.invoiceNo+'</b> ('+b.from+' to '+b.to+') has been <b>delivered</b>.</p><p>Thank you for choosing FleetCommand.</p>').catch(function(){});}
    res.json({message:'Booking status updated successfully',success:true});}catch(e){res.status(500).json({message:e.message});}});
module.exports=r;
