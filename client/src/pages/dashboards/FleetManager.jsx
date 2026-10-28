import {useState,useEffect} from 'react';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function FleetManager(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();
  const [vehicles,setVehicles]=useState([]);
  const [f,setF]=useState({vehicleNumber:'',type:'Truck',capacity:''});
  const [trip,setTrip]=useState({from:'',to:''});
  const [msg,setMsg]=useState('');
  const load=async()=>{const r=await axios.get(API+"/fleet/all");setVehicles(r.data);};
  useEffect(()=>{load();},[]);
  const addVehicle=async(e)=>{e.preventDefault();const r=await axios.post(API+"/fleet/add",f);setMsg(r.data.message);load();};
  const createTrip=async(e)=>{e.preventDefault();const r=await axios.post(API+"/trip/create",{from:trip.from,to:trip.to,status:'Scheduled'});setMsg(r.data.message);};
  return <div style={{padding:20}}>
    <button onClick={toggle}>{dark?'☀️':'🌙'}</button><button onClick={logout} style={{float:'right'}}>Logout</button>
    <h1>FleetManager Dashboard</h1>{msg&&<p style={{color:'#22c55e'}}>{msg}</p>}
    <h3>Add Vehicle</h3>
    <form onSubmit={addVehicle} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <input placeholder="Vehicle Number" onChange={e=>setF({...f,vehicleNumber:e.target.value})} required style={{padding:8}}/>
      <select onChange={e=>setF({...f,type:e.target.value})} style={{padding:8}}><option>Truck</option><option>MiniTruck</option><option>Van</option><option>Container</option><option>Refrigerated</option></select>
      <input placeholder="Capacity" onChange={e=>setF({...f,capacity:e.target.value})} style={{padding:8}}/>
      <button style={{padding:'8px 16px',background:'#2563eb',color:'#fff',border:0}}>Add</button>
    </form>
    <h3>Vehicles ({vehicles.length})</h3>
    {vehicles.map(v=><div key={v._id} style={{border:'1px solid #ccc',padding:8,margin:'6px 0'}}>{v.vehicleNumber} - {v.type} - {v.status}</div>)}
    <h3>Create Trip</h3>
    <form onSubmit={createTrip} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <input placeholder="From" onChange={e=>setTrip({...trip,from:e.target.value})} required style={{padding:8}}/>
      <input placeholder="To" onChange={e=>setTrip({...trip,to:e.target.value})} required style={{padding:8}}/>
      <button style={{padding:'8px 16px',background:'#16a34a',color:'#fff',border:0}}>Create Trip</button>
    </form>
  </div>;
}
