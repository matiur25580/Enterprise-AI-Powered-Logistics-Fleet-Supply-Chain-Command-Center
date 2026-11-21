const r = require('express').Router();
const AuditLog = require('../models/AuditLog');
const {authorize}=require('../middleware/auth');
r.get('/',authorize('Admin'),async(req,res)=>{res.json(await AuditLog.find({}).sort({createdAt:-1}).limit(200));});
r.delete('/clear',authorize('Admin'),async(req,res)=>{await AuditLog.deleteMany({});res.json({msg:'cleared'});});
module.exports = r;
