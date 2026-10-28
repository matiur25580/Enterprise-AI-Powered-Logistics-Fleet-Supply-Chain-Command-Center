require('dotenv').config();
const express=require('express');const mongoose=require('mongoose');const cors=require('cors');
const http=require('http');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
app.use(cors());app.use(express.json());
app.use('/api/auth',require('./routes/auth'));
app.use('/api/fleet',require('./routes/fleet'));
app.use('/api/trip',require('./routes/trip'));
app.use('/api/warehouse',require('./routes/warehouse'));
app.use('/api/booking',require('./routes/booking'));
app.get('/api/health',(req,res)=>res.json({status:'Logistics API running'}));
io.on('connection',(socket)=>{
  socket.on('update-location',(data)=>{io.emit('fleet-location',data);});
});
const PORT=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI||'').then(()=>{console.log('MongoDB connected');server.listen(PORT,()=>console.log('Server on '+PORT));}).catch(e=>{console.log('DB error:'+e.message);server.listen(PORT,()=>console.log('Server on '+PORT));});
