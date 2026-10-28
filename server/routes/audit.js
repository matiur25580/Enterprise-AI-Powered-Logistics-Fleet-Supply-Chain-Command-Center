const r = require('express').Router();
const AuditLog = require('../models/AuditLog');
r.get('/', async (req,res)=>{
  if(req.query.role!=='Admin') return res.status(403).json({msg:'Admin only'});
  res.json(await AuditLog.find({}).sort({createdAt:-1}).limit(200));
});
r.delete('/clear', async (req,res)=>{
  if(req.query.role!=='Admin') return res.status(403).json({msg:'Admin only'});
  await AuditLog.deleteMany({});
  res.json({msg:'cleared'});
});
module.exports = r;
