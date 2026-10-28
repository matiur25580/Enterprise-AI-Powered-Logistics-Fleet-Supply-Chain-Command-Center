import {useEffect,useState} from 'react';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const V_TYPES=['Truck','MiniTruck','Van','Container','Refrigerated'];
const V_STATUS=['Active','Maintenance','OnTrip','Idle'];
const T_STATUS=['Scheduled','OnGoing','Delivered','Cancelled'];
export default function FleetManager(){
  const {logout}=useAuth(); const {dark,toggle}=useTheme();
  const [tab,setTab]=useState('vehicles');
  const [vehicles,setVehicles]=useState([]); const [trips,setTrips]=useState([]);
  const [drivers,setDrivers]=useState([]);
  const [bookings,setBookings]=useState([]); const [msg,setMsg]=useState('');
  const [vf,setVf]=useState({vehicleNumber:'',type:'Truck',capacity:'',driver:''});
  const [tf,setTf]=useState({vehicle:'',driver:'',from:'',to:'',startDate:''});
  const bg=dark?'#0a1128':'#eef2f9', card=dark?'#101d38':'#ffffff';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const inp={width:'100%',padding:'10px 12px',margin:'0 0 8px 0',borderRadius:8,border:bd,background:dark?'#0b152b':'#f4f7fc',color:text,boxSizing:'border-box',fontSize:14};
  const btn={padding:'10px 16px',borderRadius:8,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:700,cursor:'pointer',fontSize:14};
  const tabBtn=(a)=>({padding:'10px 14px',borderRadius:8,border:bd,background:a?'linear-gradient(90deg,#f59e0b,#f97316)':card,color:a?'#231303':text,fontWeight:700,cursor:'pointer',fontSize:13});
  const th={textAlign:'left',padding:'10px',borderBottom:bd,color:sub,fontSize:12,textTransform:'uppercase',whiteSpace:'nowrap'};
  const td={padding:'10px',borderBottom:bd,fontSize:14,whiteSpace:'nowrap'};
  const load=async()=>{
    const g=async(u)=>{try{const r=await axios.get(API+u);return r.data||[];}catch(e){return [];}};
    setVehicles(await g('/fleet/all')); setTrips(await g('/trip/all'));
    setDrivers(await g('/auth/by-role/Driver'));
    setBookings(await g('/booking/all'));
  };
  useEffect(()=>{load();},[]);
  const ok=(m)=>{setMsg(m);setTimeout(()=>setMsg(''),3500);};
  const addVehicle=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/fleet/add',vf);ok(r.data.message);
    setVf({vehicleNumber:'',type:'Truck',capacity:'',driver:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const vStatus=async(id,status)=>{try{
    const r=await axios.put(API+'/fleet/status/'+id,{status});ok(r.data.message);load();
  }catch(e){ok(e.message);}};
  const addTrip=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/trip/create',tf);ok(r.data.message);
    if(tf.bookingId){try{await axios.put(API+'/booking/status/'+tf.bookingId,{status:'Confirmed'});}catch(e){}}
    setTf({vehicle:'',driver:'',from:'',to:'',startDate:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const tStatus=async(id,status)=>{try{
    const r=await axios.put(API+'/trip/status/'+id,{status});ok(r.data.message);load();
  }catch(e){ok(e.message);}};
  const onTrip=vehicles.filter(v=>v.status==='OnTrip').length;
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 style={{margin:0,fontSize:21}}>Fleet Manager Dashboard</h1><span style={{background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:800,fontSize:11,padding:'5px 14px',borderRadius:20,letterSpacing:1.5}}>FLEET MANAGER</span></div>
      <div><button onClick={toggle} style={{...btn,background:card,color:text,border:bd,marginRight:8}}>{dark?'Light':'Dark'}</button>
      <button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button></div>
    </div>
    {msg&&<div style={{background:card,border:bd,borderRadius:8,padding:10,marginBottom:12,textAlign:'center',fontSize:14}}>{msg}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
      {[['Total Vehicles',vehicles.length],['On Trip',onTrip],['Idle',vehicles.filter(v=>v.status==='Idle').length],['Maintenance',vehicles.filter(v=>v.status==='Maintenance').length]].map(s=>(
        <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:14,textAlign:'center'}}>
          <div style={{fontSize:13,color:sub}}>{s[0]}</div>
          <div style={{fontSize:28,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
        </div>))}
    </div>
    <div style={{display:'flex',gap:8,marginBottom:14}}>
      <button onClick={()=>setTab('vehicles')} style={tabBtn(tab==='vehicles')}>Vehicles</button>
      <button onClick={()=>setTab('trips')} style={tabBtn(tab==='trips')}>Trips</button>
      <button onClick={()=>setTab('bookings')} style={tabBtn(tab==='bookings')}>Bookings</button>
    </div>
    {tab==='vehicles'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Add Vehicle</h3>
      <form onSubmit={addVehicle} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <input placeholder="Vehicle Number" value={vf.vehicleNumber} onChange={e=>setVf({...vf,vehicleNumber:e.target.value})} style={inp} required/>
        <select value={vf.type} onChange={e=>setVf({...vf,type:e.target.value})} style={inp}>{V_TYPES.map(x=><option key={x} value={x}>{x}</option>)}</select>
        <input placeholder="Capacity (e.g. 10 Ton)" value={vf.capacity} onChange={e=>setVf({...vf,capacity:e.target.value})} style={inp}/>
        <select value={vf.driver} onChange={e=>setVf({...vf,driver:e.target.value})} style={inp}>
          <option value="">Assign Driver (optional)</option>
          {drivers.map(x=><option key={x._id} value={x._id}>{x.fullName}</option>)}
        </select>
        <button style={btn}>+ Add Vehicle</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Vehicle No</th><th style={th}>Type</th><th style={th}>Capacity</th><th style={th}>Driver</th><th style={th}>Status</th></tr></thead>
        <tbody>{vehicles.map(v=>(
          <tr key={v._id}>
            <td style={td}><b>{v.vehicleNumber}</b></td><td style={td}>{v.type}</td><td style={td}>{v.capacity||'-'}</td>
            <td style={td}>{(v.driver&&v.driver.fullName)||'-'}</td>
            <td style={td}><select value={v.status} onChange={e=>vStatus(v._id,e.target.value)} style={{...inp,margin:0,width:'auto'}}>{V_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
          </tr>))}
        </tbody></table></div>
      {vehicles.length===0&&<p style={{color:sub,textAlign:'center'}}>No vehicles yet.</p>}
    </div>}
    {tab==='bookings'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Client Bookings — Convert to Trip</h3>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Invoice</th><th style={th}>Client</th><th style={th}>Route</th><th style={th}>Goods</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
        <tbody>{bookings.map(b=>(
          <tr key={b._id}>
            <td style={td}><b>{b.invoiceNo}</b></td><td style={td}>{b.clientName||'-'}</td>
            <td style={td}>{b.from} to {b.to}</td><td style={td}>{b.goods||'-'}</td>
            <td style={td}>{b.status||'Pending'}</td>
            <td style={td}>{(b.status||'Pending')==='Pending'||(b.status||'Pending')==='Confirmed'
              ?<button onClick={()=>{setTf({vehicle:'',driver:'',bookingId:b._id,from:b.from||'',to:b.to||'',startDate:''});setTab('trips');window.scrollTo(0,0);}} style={{...btn,padding:'6px 12px',fontSize:12}}>Create Trip</button>
              :<span style={{color:sub,fontSize:12}}>Converted</span>}</td>
          </tr>))}
        </tbody></table></div>
      {bookings.length===0&&<p style={{color:sub,textAlign:'center'}}>No bookings yet.</p>}
    </div>}
    {tab==='trips'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Create Trip</h3>
      {tf.bookingId&&<p style={{color:'#f59e0b',fontSize:14}}>Converting booking to trip — on create, booking will be marked Confirmed.</p>}
      <form onSubmit={addTrip} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <select value={tf.vehicle} onChange={e=>setTf({...tf,vehicle:e.target.value})} style={inp} required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v=><option key={v._id} value={v._id}>{v.vehicleNumber} ({v.type})</option>)}
        </select>
        <select value={tf.driver} onChange={e=>setTf({...tf,driver:e.target.value})} style={inp}>
          <option value="">Assign Driver (optional)</option>
          {drivers.map(x=><option key={x._id} value={x._id}>{x.fullName}</option>)}
        </select>
        <input placeholder="From" value={tf.from} onChange={e=>setTf({...tf,from:e.target.value})} style={inp} required/>
        <input placeholder="To" value={tf.to} onChange={e=>setTf({...tf,to:e.target.value})} style={inp} required/>
        <input type="date" value={tf.startDate} onChange={e=>setTf({...tf,startDate:e.target.value})} style={inp}/>
        <button style={btn}>+ Create Trip</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Vehicle</th><th style={th}>Driver</th><th style={th}>Route</th><th style={th}>Status</th><th style={th}>Start</th></tr></thead>
        <tbody>{trips.map(t=>(
          <tr key={t._id}>
            <td style={td}><b>{(t.vehicle&&t.vehicle.vehicleNumber)||'-'}</b></td>
            <td style={td}>{(t.driver&&t.driver.fullName)||'-'}</td>
            <td style={td}>{t.from} to {t.to}</td>
            <td style={td}><select value={t.status} onChange={e=>tStatus(t._id,e.target.value)} style={{...inp,margin:0,width:'auto'}}>{T_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
            <td style={td}>{t.startDate?new Date(t.startDate).toLocaleDateString():'-'}</td>
          </tr>))}
        </tbody></table></div>
      {trips.length===0&&<p style={{color:sub,textAlign:'center'}}>No trips yet.</p>}
    </div>}
  </div>);
}
