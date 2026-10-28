import {useEffect,useState,useRef} from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API.replace('/api','');
const socket=io(SOCKET_URL);
const T_STATUS=['Scheduled','OnGoing','Delivered','Cancelled'];
export default function Driver(){
  const {user,logout}=useAuth(); const {dark,toggle}=useTheme();
  const [trips,setTrips]=useState([]); const [myVehicle,setMyVehicle]=useState(null);
  const [sharing,setSharing]=useState(false); const [loc,setLoc]=useState({lat:22.5726,lng:88.3639});
  const [msg,setMsg]=useState('');
  const timer=useRef(null);
  const bg=dark?'#0a1128':'#eef2f9', card=dark?'#101d38':'#ffffff';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const btn={padding:'10px 16px',borderRadius:8,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:700,cursor:'pointer',fontSize:14};
  const inp={padding:'8px 10px',borderRadius:8,border:bd,background:dark?'#0b152b':'#f4f7fc',color:text,fontSize:13};
  const ok=(m)=>{setMsg(m);setTimeout(()=>setMsg(''),3500);};
  const load=async()=>{
    try{
      const t=await axios.get(API+'/trip/all');
      const mine=(t.data||[]).filter(x=>x.driver&&(x.driver._id===user._id||x.driver===user._id));
      setTrips(mine);
      const v=await axios.get(API+'/fleet/all');
      const mv=(v.data||[]).find(x=>x.driver&&(x.driver._id===user._id||(x.driver._id&&x.driver._id===user._id)));
      setMyVehicle(mv||null);
    }catch(e){console.error(e);}
  };
  useEffect(()=>{load();return()=>{if(timer.current)clearInterval(timer.current);};},[]);
  const toggleShare=()=>{
    if(sharing){clearInterval(timer.current);timer.current=null;setSharing(false);}
    else{
      setSharing(true);
      timer.current=setInterval(()=>{
        setLoc(p=>{
          const n={lat:p.lat+0.0008,lng:p.lng+0.0008,driver:user.fullName||'Driver'};
          socket.emit('update-location',n);return n;
        });
      },3000);
    }
  };
  const setStatus=async(id,status)=>{try{
    const r=await axios.put(API+'/trip/status/'+id,{status});
    const tr=trips.find(x=>x._id===id);
    if(status==='Delivered'&&tr&&tr.bookingId){
      try{await axios.put(API+'/booking/status/'+tr.bookingId,{status:'Delivered'});ok('Delivered! Client notified by email.');}catch(e){ok(r.data.message);}
    } else ok(r.data.message);
    load();
  }catch(e){ok(e.message);}};
  const active=trips.filter(t=>t.status==='OnGoing'||t.status==='Scheduled').length;
  const done=trips.filter(t=>t.status==='Delivered').length;
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <h1 style={{margin:0,fontSize:21}}>Driver Dashboard</h1>
      <div><button onClick={toggle} style={{...btn,background:card,color:text,border:bd,marginRight:8}}>{dark?'Light':'Dark'}</button>
      <button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button></div>
    </div>
    {msg&&<div style={{background:card,border:bd,borderRadius:8,padding:10,marginBottom:12,textAlign:'center',fontSize:14}}>{msg}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
      {[['Assigned Trips',trips.length],['Active',active],['Delivered',done],['My Vehicle',myVehicle?myVehicle.vehicleNumber:'-']].map(s=>(
        <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:14,textAlign:'center'}}>
          <div style={{fontSize:13,color:sub}}>{s[0]}</div>
          <div style={{fontSize:24,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
        </div>))}
    </div>
    <div style={{background:card,border:bd,borderRadius:12,padding:16,marginBottom:14}}>
      <h3 style={{marginTop:0}}>Live Location Sharing</h3>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <button onClick={toggleShare} style={{...btn,background:sharing?'#dc2626':'linear-gradient(90deg,#22c55e,#16a34a)',color:'#fff'}}>
          {sharing?'Stop Sharing':'Start Sharing'}
        </button>
        <span style={{color:sharing?'#22c55e':sub,fontSize:14}}>{sharing?'Broadcasting live location to command center':'Location sharing is OFF'}</span>
      </div>
      {sharing&&<p style={{fontSize:14,color:sub}}>Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)} (updates every 3s)</p>}
    </div>
    <div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>My Assigned Trips ({trips.length})</h3>
      {trips.map(t=>(
        <div key={t._id} style={{border:bd,borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>{t.from} to {t.to}</div>
              <div style={{fontSize:13,color:sub}}>Vehicle: {(t.vehicle&&t.vehicle.vehicleNumber)||'-'}{t.startDate?' | Start: '+new Date(t.startDate).toLocaleDateString():''}</div>
            </div>
            <select value={t.status} onChange={e=>setStatus(t._id,e.target.value)} style={inp}>
              {T_STATUS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>))}
      {trips.length===0&&<p style={{color:sub,textAlign:'center'}}>No trips assigned to you yet. Contact your fleet manager.</p>}
    </div>
  </div>);
}
