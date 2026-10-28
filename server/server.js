const dns=require('dns');
try{dns.setDefaultResultOrder('ipv4first');}catch(e){}
require('dotenv').config();
const express=require('express');const mongoose=require('mongoose');const cors=require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auditNotify = require('./utils/auditNotify');
const http=require('http');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
app.use(cors());app.use(express.json());
app.use(helmet({contentSecurityPolicy:false}));
app.set('trust proxy', 1);
const authLimiter = rateLimit({windowMs:15*60*1000, max:60, message:{msg:'Too many attempts. Try again in 15 minutes.'}});
function strongPassword(req,res,next){
  const pth=req.path||'';
  if(/register|reset|signup|change|forgot/i.test(pth)){
    const b=req.body||{};
    const pw=(b.password!==undefined)?b.password:b.newPassword;
    if(pw!==undefined && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw))
      return res.status(400).json({msg:'Password must be 8+ characters with UPPER, lower and number'});
  }
  next();
}
app.use(auditNotify);
// ---- enterprise security: brute-force guard + password policy ----
// ---- enterprise security: brute-force guard + password policy ----
app.use('/api/auth',authLimiter, strongPassword, authLimiter, strongPassword, require('./routes/auth'));
app.use('/api/fleet',require('./routes/fleet'));
app.use('/api/trip',require('./routes/trip'));
app.use('/api/warehouse',require('./routes/warehouse'));
app.use('/api/booking',require('./routes/booking'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/documents', require('./routes/documents'));
app.get('/api/health',(req,res)=>res.json({status:'Logistics API running'}));
io.on('connection',(socket)=>{
  socket.on('update-location',(data)=>{io.emit('fleet-location',data);});
});
const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||'').then(()=>{console.log('MongoDB connected');server.listen(PORT,()=>console.log('Server on '+PORT));}).catch(e=>{console.log('DB error:'+e.message);server.listen(PORT,()=>console.log('Server on '+PORT));});
