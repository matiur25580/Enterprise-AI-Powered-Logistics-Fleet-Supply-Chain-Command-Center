const r = require('express').Router();
const Notification = require('../models/Notification');
r.get('/my', async (req,res)=>{
  res.json(await Notification.find({to:req.query.email}).sort({createdAt:-1}).limit(60));
});
r.put('/read-all', async (req,res)=>{
  await Notification.updateMany({to:req.query.email},{read:true});
  res.json({msg:'ok'});
});
r.put('/:id/read', async (req,res)=>{
  await Notification.findByIdAndUpdate(req.params.id,{read:true});
  res.json({msg:'ok'});
});
r.post('/', async (req,res)=>{
  res.json(await Notification.create(req.body));
});
module.exports = r;
