import {useEffect,useState} from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API.replace('/api','');
const socket=io(SOCKET_URL);
const V_TYPES=['Truck','MiniTruck','Van','Container','Refrigerated'];
const V_STATUS=['Active','Maintenance','OnTrip','Idle'];
const T_STATUS=['Scheduled','OnGoing','Delivered','Cancelled'];
export default function Admin(){
  const {logout}=useAuth(); const {dark,toggle}=useTheme();
  const [tab,setTab]=useState('vehicles');
  const [vehicles,setVehicles]=useState([]); const [trips,setTrips]=useState([]);
  const [warehouses,setWarehouses]=useState([]); const [bookings,setBookings]=useState([]);
  const [drivers,setDrivers]=useState([]); const [managers,setManagers]=useState([]);
  const [live,setLive]=useState([]); const [msg,setMsg]=useState('');
  const [vf,setVf]=useState({vehicleNumber:'',type:'Truck',capacity:'',driver:''});
  const [tf,setTf]=useState({vehicle:'',driver:'',from:'',to:'',startDate:''});
  const [wf,setWf]=useState({name:'',location:'',totalCapacity:'',manager:''});
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
    setWarehouses(await g('/warehouse/all')); setBookings(await g('/booking/all'));
    setDrivers(await g('/auth/by-role/Driver')); setManagers(await g('/auth/by-role/WarehouseManager'));
  };
  useEffect(()=>{load();socket.on('fleet-location',(d)=>{setLive(p=>[...p.slice(-9),d]);});},[]);
  const ok=(m)=>{setMsg(m);setTimeout(()=>setMsg(''),3500);};
  const addVehicle=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/fleet/add',vf);ok(r.data.message);
    setVf({vehicleNumber:'',type:'Truck',capacity:'',driver:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const delVehicle=async(id)=>{if(!window.confirm('Delete this vehicle?'))return;try{
    const r=await axios.delete(API+'/fleet/'+id);ok(r.data.message);load();
  }catch(e){ok(e.message);}};
  const vStatus=async(id,status)=>{try{
    const r=await axios.put(API+'/fleet/status/'+id,{status});ok(r.data.message);load();
  }catch(e){ok(e.message);}};
  const addTrip=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/trip/create',tf);ok(r.data.message);
    setTf({vehicle:'',driver:'',from:'',to:'',startDate:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const tStatus=async(id,status)=>{try{
    const r=await axios.put(API+'/trip/status/'+id,{status});ok(r.data.message);load();
  }catch(e){ok(e.message);}};
  const addWh=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/warehouse/add',wf);ok(r.data.message);
    setWf({name:'',location:'',totalCapacity:'',manager:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const stats=[['Vehicles',vehicles.length,'vehicles'],['Trips',trips.length,'trips'],['Warehouses',warehouses.length,'warehouses'],['Bookings',bookings.length,'bookings']];
  const tabs=[['vehicles','Vehicles'],['trips','Trips'],['warehouses','Warehouses'],['bookings','Bookings'],['live','Live Tracking']];
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <h1 style={{margin:0,fontSize:21}}>Admin Dashboard - Command Center</h1>
      <div>
        <button onClick={toggle} style={{...btn,background:card,color:text,border:bd,marginRight:8}}>{dark?'Light':'Dark'}</button>
        <button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button>
      </div>
    </div>
    {msg&&<div style={{background:card,border:bd,borderRadius:8,padding:10,marginBottom:12,textAlign:'center',fontSize:14}}>{msg}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
      {stats.map(s=>(
        <div key={s[2]} onClick={()=>setTab(s[2])} style={{background:card,border:bd,borderRadius:12,padding:14,textAlign:'center',cursor:'pointer'}}>
          <div style={{fontSize:13,color:sub}}>{s[0]}</div>
          <div style={{fontSize:28,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
        </div>))}
    </div>
    <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
      {tabs.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} style={tabBtn(tab===t[0])}>{t[1]}</button>)}
    </div>
    {tab==='vehicles'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Add Vehicle</h3>
      <form onSubmit={addVehicle} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <input placeholder="Vehicle Number" value={vf.vehicleNumber} onChange={e=>setVf({...vf,vehicleNumber:e.target.value})} style={inp} required/>
        <select value={vf.type} onChange={e=>setVf({...vf,type:e.target.value})} style={inp}>{V_TYPES.map(x=><option key={x} value={x}>{x}</option>)}</select>
        <input placeholder="Capacity (e.g. 10 Ton)" value={vf.capacity} onChange={e=>setVf({...vf,capacity:e.target.value})} style={inp}/>
        <select value={vf.driver} onChange={e=>setVf({...vf,driver:e.target.value})} style={inp}>
          <option value="">Assign Driver (optional)</option>
          {drivers.map(d=><option key={d._id} value={d._id}>{d.fullName}</option>)}
        </select>
        <button style={btn}>+ Add Vehicle</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Vehicle No</th><th style={th}>Type</th><th style={th}>Capacity</th><th style={th}>Driver</th><th style={th}>Status</th><th style={th}>Action</th></tr></thead>
        <tbody>{vehicles.map(v=>(
          <tr key={v._id}>
            <td style={td}><b>{v.vehicleNumber}</b></td><td style={td}>{v.type}</td><td style={td}>{v.capacity||'-'}</td>
            <td style={td}>{(v.driver&&v.driver.fullName)||'-'}</td>
            <td style={td}><select value={v.status} onChange={e=>vStatus(v._id,e.target.value)} style={{...inp,margin:0,width:'auto'}}>{V_STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
            <td style={td}><button onClick={()=>delVehicle(v._id)} style={{...btn,background:'#dc2626',color:'#fff',padding:'6px 12px'}}>Delete</button></td>
          </tr>))}
        </tbody></table></div>
      {vehicles.length===0&&<p style={{color:sub,textAlign:'center'}}>No vehicles yet. Add your first vehicle above.</p>}
    </div>}
    {tab==='trips'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Create Trip</h3>
      <form onSubmit={addTrip} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <select value={tf.vehicle} onChange={e=>setTf({...tf,vehicle:e.target.value})} style={inp} required>
          <option value="">Select Vehicle</option>
          {vehicles.map(v=><option key={v._id} value={v._id}>{v.vehicleNumber} ({v.type})</option>)}
        </select>
        <select value={tf.driver} onChange={e=>setTf({...tf,driver:e.target.value})} style={inp}>
          <option value="">Assign Driver (optional)</option>
          {drivers.map(d=><option key={d._id} value={d._id}>{d.fullName}</option>)}
        </select>
        <input placeholder="From" value={tf.from} onChange={e=>setTf({...tf,from:e.target.value})} style={inp} required/>
        <input placeholder="To" value={tf.to} onChange={e=>setTf({...tf,to:e.target.value})} style={inp} required/>
        <input type="date" value={tf.startDate} onChange={e=>setTf({...tf,startDate:e.target.value})} style={inp}/>
        <button style={btn}>+ Create Trip</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Vehicle</th><th style={th}>Driver</th><th style={th}>Route</th><th style={th}>Status</th><th style={th}>Start Date</th></tr></thead>
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
    {tab==='warehouses'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Add Warehouse</h3>
      <form onSubmit={addWh} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <input placeholder="Warehouse Name" value={wf.name} onChange={e=>setWf({...wf,name:e.target.value})} style={inp} required/>
        <input placeholder="Location" value={wf.location} onChange={e=>setWf({...wf,location:e.target.value})} style={inp}/>
        <input type="number" placeholder="Total Capacity" value={wf.totalCapacity} onChange={e=>setWf({...wf,totalCapacity:e.target.value})} style={inp} required/>
        <select value={wf.manager} onChange={e=>setWf({...wf,manager:e.target.value})} style={inp}>
          <option value="">Assign Manager (optional)</option>
          {managers.map(m=><option key={m._id} value={m._id}>{m.fullName}</option>)}
        </select>
        <button style={btn}>+ Add Warehouse</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Name</th><th style={th}>Location</th><th style={th}>Capacity Used</th><th style={th}>Manager</th></tr></thead>
        <tbody>{warehouses.map(w=>(
          <tr key={w._id}>
            <td style={td}><b>{w.name}</b></td><td style={td}>{w.location||'-'}</td>
            <td style={td}>{w.usedCapacity||0} / {w.totalCapacity}
              <div style={{height:6,background:dark?'#0b152b':'#e5eaf2',borderRadius:3,marginTop:4,minWidth:80}}>
                <div style={{height:6,width:Math.min(100,((w.usedCapacity||0)/(w.totalCapacity||1))*100)+'%',background:'linear-gradient(90deg,#f59e0b,#f97316)',borderRadius:3}}/>
              </div></td>
            <td style={td}>{(w.manager&&w.manager.fullName)||'-'}</td>
          </tr>))}
        </tbody></table></div>
      {warehouses.length===0&&<p style={{color:sub,textAlign:'center'}}>No warehouses yet.</p>}
    </div>}
    {tab==='bookings'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>All Bookings ({bookings.length})</h3>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Client</th><th style={th}>Route</th><th style={th}>Goods</th><th style={th}>Weight</th><th style={th}>Status</th><th style={th}>Date</th></tr></thead>
        <tbody>{bookings.map(b=>(
          <tr key={b._id}>
            <td style={td}>{b.name||b.clientName||b.fullName||'-'}</td>
            <td style={td}>{b.from} to {b.to}</td>
            <td style={td}>{b.goods||'-'}</td><td style={td}>{b.weight||'-'}</td>
            <td style={td}>{b.status||'Pending'}</td>
            <td style={td}>{b.createdAt?new Date(b.createdAt).toLocaleDateString():'-'}</td>
          </tr>))}
        </tbody></table></div>
      {bookings.length===0&&<p style={{color:sub,textAlign:'center'}}>No bookings yet.</p>}
    </div>}
    {tab==='live'&&<div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Live Fleet Tracking</h3>
      {live.map((l,i)=><div key={i} style={{padding:'8px 0',borderBottom:bd,fontSize:14}}>Truck {l.driver} : {Number(l.lat).toFixed(4)}, {Number(l.lng).toFixed(4)}</div>)}
      {live.length===0&&<p style={{color:sub}}>Waiting for live location updates from drivers...</p>}
      <p style={{color:'#22c55e'}}>All systems operational</p>
    </div>}
  </div>);
}
