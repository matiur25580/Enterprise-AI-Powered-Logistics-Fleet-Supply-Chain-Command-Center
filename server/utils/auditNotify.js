const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const SKIP = ['/api/auth/login','/api/auth/register','/api/auth/send-otp','/api/auth/verify','/api/auth/forgot','/api/auth/reset','/api/notifications','/api/audit'];
async function notifyRoles(roles, title, message, excludeEmail){
  try{
    const users = await User.find({role:{$in:roles}}).select('email');
    const docs = users.filter(u=>u.email && u.email!==excludeEmail).map(u=>({to:u.email, title, message, type:'alert'}));
    if(docs.length) await Notification.insertMany(docs);
  }catch(e){}
}
module.exports = function auditNotify(req,res,next){
  if(!['POST','PUT','DELETE','PATCH'].includes(req.method)) return next();
  const fullPath = (req.baseUrl||'') + (req.path||'');
  if(SKIP.some(p=>fullPath.startsWith(p))) return next();
  const origJson = res.json.bind(res);
  res.json = function(body){
    if(res.statusCode < 400){
      // Authentication middleware runs before route handlers and populates req.user.
      // Never trust actor identity or role supplied by a client-controlled body, query, or JWT decode.
      const actorEmail = req.user && req.user.email ? req.user.email : 'system';
      const role = req.user && req.user.role ? req.user.role : '-';
      const safe = Object.assign({}, req.body||{});
      delete safe.password; delete safe.newPassword; delete safe.otp;
      AuditLog.create({actor:actorEmail, role, action:req.method+' '+fullPath,
        entity:(req.baseUrl||'').split('/').pop(), details:JSON.stringify(safe).slice(0,600), ip:req.ip}).catch(()=>{});
      const p = fullPath, m = req.method, b = req.body||{};
      if(m==='POST' && p.startsWith('/api/booking') && !p.includes('billing'))
        notifyRoles(['Admin','FleetManager'],'New booking received','New booking created by '+actorEmail, actorEmail);
      else if(p.includes('/billing'))
        notifyRoles(['Admin'],'Invoice updated','Billing updated by '+actorEmail, actorEmail);
      else if(m==='POST' && p.startsWith('/api/trip'))
        notifyRoles(['Admin','FleetManager'],'New trip created','Trip created by '+actorEmail, actorEmail);
      else if(m==='PUT' && p.startsWith('/api/trip') && /deliver/i.test(b.status||''))
        notifyRoles(['Admin'],'Trip delivered','A trip was marked delivered', actorEmail);
      else if(p.startsWith('/api/fleet'))
        notifyRoles(['Admin','FleetManager'],'Fleet updated', m+' '+p+' by '+actorEmail, actorEmail);
      else if(p.startsWith('/api/maintenance'))
        notifyRoles(['Admin','FleetManager'],'Maintenance update','Maintenance activity by '+actorEmail, actorEmail);
    }
    return origJson(body);
  };
  next();
};
