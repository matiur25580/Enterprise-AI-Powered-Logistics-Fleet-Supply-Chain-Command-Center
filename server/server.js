const dns=require('dns');
try{dns.setDefaultResultOrder('ipv4first');}catch(e){}
require('dotenv').config();
const express=require('express');const mongoose=require('mongoose');const cors=require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auditNotify = require('./utils/auditNotify');
const { authenticate } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const { canViewFleetLocation } = require('./utils/fleetLocationPolicy');
const {isStrongPassword} = require('./utils/passwordPolicy');
const http=require('http');const {Server}=require('socket.io');
// HTTP API and Socket.IO share one server so live fleet updates use the same deployment endpoint.
const app=express();const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
app.use(cors());app.use(express.json())

// Sanitize: empty-string ObjectId fields -> null (prevents Cast to ObjectId errors)
app.use((req,res,next)=>{
  if(req.body && typeof req.body==='object'){
    for(const k of ['driver','vehicle','bookingId','warehouse']){
      if(req.body[k]==='') req.body[k]=null;
    }
  }
  next();
});
;
app.use(helmet({contentSecurityPolicy:false}));
app.set('trust proxy', 1);
const authLimiter = rateLimit({windowMs:15*60*1000, max:60, message:{msg:'Too many attempts. Try again in 15 minutes.'}});
function strongPassword(req,res,next){
  const pth=req.path||'';
  if(/register|reset|signup|change|forgot/i.test(pth)){
    const b=req.body||{};
    const pw=(b.password!==undefined)?b.password:b.newPassword;
    if(pw!==undefined && !isStrongPassword(pw))
      return res.status(400).json({msg:'Password must be 8+ characters with UPPER, lower and number'});
  }
  next();
}
app.use(auditNotify);
// ---- enterprise security: brute-force guard + password policy ----
// ---- enterprise security: brute-force guard + password policy ----
app.use('/api/auth',authLimiter, strongPassword, require('./routes/auth'));
app.use('/api/fleet', authenticate, require('./routes/fleet'));
app.use('/api/trip', authenticate, require('./routes/trip'));
app.use('/api/warehouse', authenticate, require('./routes/warehouse'));
app.use('/api/booking', authenticate, require('./routes/booking'));
app.use('/api/audit', authenticate, require('./routes/audit'));
app.use('/api/notifications', authenticate, require('./routes/notification'));
app.use('/api/maintenance', authenticate, require('./routes/maintenance'));
app.use('/api/documents', authenticate, require('./routes/documents'));
app.use('/api/forecast', authenticate, require('./routes/forecast'));
app.get('/api/health',(req,res)=>res.json({status:'Logistics API running'}));
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token || !process.env.JWT_SECRET) return next(new Error('Authentication required'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('_id role');
    if (!user) return next(new Error('Invalid session'));
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
});
io.on('connection',(socket)=>{
  // Precise driver locations are restricted to fleet operations staff.
  if (canViewFleetLocation(socket.user.role)) socket.join('fleet-operations');
  socket.on('update-location',async(data)=>{
    try {
      if(socket.user.role!=='Driver'||!data||!Number.isFinite(Number(data.lat))||!Number.isFinite(Number(data.lng)))return;
      const lat=Number(data.lat),lng=Number(data.lng);
      if(lat < -90 || lat > 90 || lng < -180 || lng > 180)return;
      const vehicle=await Vehicle.findOne({driver:socket.user._id});
      if(!vehicle)return;
      vehicle.lastLocation={lat,lng};
      await vehicle.save();
      io.to('fleet-operations').emit('fleet-location',{vehicleId:String(vehicle._id),vehicleNumber:vehicle.vehicleNumber,lat,lng,driverId:String(socket.user._id)});
    } catch(error) {
      socket.emit('location-error',{message:'Unable to update location'});
    }
  });
});
const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||'').then(()=>{console.log('MongoDB connected');server.listen(PORT,()=>console.log('Server on '+PORT));}).catch(e=>{console.log('DB error:'+e.message);server.listen(PORT,()=>console.log('Server on '+PORT));});
