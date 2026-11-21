const express=require('express');const PDFDocument=require('pdfkit');const Booking=require('../models/Booking');const r=express.Router();
const {authorize}=require('../middleware/auth');
const {sendMail}=require('../utils/mailer');
const {normalizeBookingInput,isBookingStatus,isPaymentStatus,parseNonNegativeAmount,escapeHtml}=require('../utils/bookingValidation');
r.post('/create',authorize('Client','Admin','FleetManager'),async(req,res)=>{try{
  const input=normalizeBookingInput(req.body);
  if(!input)return res.status(400).json({message:'Provide a valid client name, email, origin, and destination.'});
  const invoiceNo='INV'+Date.now();
  const b=await Booking.create({...input,invoiceNo});
  if(input.email){sendMail(input.email,'Booking Received - '+b.invoiceNo,
      '<h2>FleetCommand</h2><p>Hi '+escapeHtml(b.clientName||'Customer')+',</p><p>Your shipment booking has been received.</p><p><b>Invoice:</b> '+b.invoiceNo+'<br><b>Route:</b> '+escapeHtml(b.from)+' to '+escapeHtml(b.to)+'<br><b>Goods:</b> '+escapeHtml(b.goods||'-')+' | <b>Weight:</b> '+escapeHtml(b.weight||'-')+'</p><p>You will be notified on delivery.</p>').catch(function(){});}
  res.json({message:'Booking created successfully',success:true,b});
}catch(e){res.status(500).json({message:e.message});}});
r.get('/all',authorize('Admin','FleetManager','Accountant','Client'),async(req,res)=>{const filter=req.user.role==='Client'?{email:req.user.email}:{};res.json(await Booking.find(filter).sort({createdAt:-1}));});
r.get('/invoice/:id',authorize('Admin','FleetManager','Accountant','Client'),async(req,res)=>{
  const b=await Booking.findById(req.params.id);if(!b)return res.status(404).send('Not found');
  if(req.user.role==='Client'&&b.email!==req.user.email)return res.status(403).json({message:'You can only access your own invoices'});
  const doc=new PDFDocument();res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename=${b.invoiceNo}.pdf`);
  doc.pipe(res);doc.fontSize(20).text('Logistics Invoice',100,100);doc.fontSize(12).text(`Invoice No: ${b.invoiceNo}`,100,140);doc.text(`Client: ${b.clientName}`,100,160);doc.text(`From: ${b.from} To: ${b.to}`,100,180);doc.text(`Goods: ${b.goods} Weight: ${b.weight}`,100,200);doc.text(`Status: ${b.status}`,100,220);doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`,100,240);doc.end();
});
r.put('/status/:id',authorize('Admin','FleetManager'),async(req,res)=>{try{
    if(!isBookingStatus(req.body.status))return res.status(400).json({message:'Invalid booking status'});
    const b=await Booking.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true,runValidators:true});
    if(!b)return res.status(404).json({message:'Booking not found'});
    if(b&&req.body.status==='Delivered'&&b.email){sendMail(b.email,'Shipment Delivered - '+b.invoiceNo,
      '<h2>FleetCommand</h2><p>Hi '+escapeHtml(b.clientName||'Customer')+',</p><p>Your shipment <b>'+b.invoiceNo+'</b> ('+escapeHtml(b.from)+' to '+escapeHtml(b.to)+') has been <b>delivered</b>.</p><p>Thank you for choosing FleetCommand.</p>').catch(function(){});}
    if(b&&req.body.status==='Approved'&&b.email){sendMail(b.email,'Booking Approved - '+b.invoiceNo,'<h2>FleetCommand</h2><p>Hi '+escapeHtml(b.clientName||'Customer')+',</p><p>Your booking <b>'+b.invoiceNo+'</b> ('+b.from+' to '+b.to+') has been <b>approved</b>. We will schedule your shipment soon.</p>').catch(function(){});}
    if(b&&req.body.status==='Rejected'&&b.email){sendMail(b.email,'Booking Update - '+b.invoiceNo,'<h2>FleetCommand</h2><p>Hi '+escapeHtml(b.clientName||'Customer')+',</p><p>Your booking <b>'+b.invoiceNo+'</b> ('+b.from+' to '+b.to+') could not be accepted at this time. Please contact support.</p>').catch(function(){});}
    res.json({message:'Booking status updated successfully',success:true});}catch(e){res.status(500).json({message:e.message});}});

r.put('/billing/:id',authorize('Admin','Accountant'),async(req,res)=>{try{const u={};if(req.body.amount!==undefined&&req.body.amount!==''){const amount=parseNonNegativeAmount(req.body.amount);if(amount===null)return res.status(400).json({message:'Amount must be a non-negative number'});u.amount=amount;}if(req.body.paymentStatus!==undefined){if(!isPaymentStatus(req.body.paymentStatus))return res.status(400).json({message:'Invalid payment status'});u.paymentStatus=req.body.paymentStatus;}if(!Object.keys(u).length)return res.status(400).json({message:'Provide an amount or payment status to update'});const b=await Booking.findByIdAndUpdate(req.params.id,u,{new:true,runValidators:true});if(!b)return res.status(404).json({message:'Booking not found'});res.json({message:'Billing updated',success:true,booking:b})}catch(e){res.status(500).json({message:e.message})}});
module.exports=r;
