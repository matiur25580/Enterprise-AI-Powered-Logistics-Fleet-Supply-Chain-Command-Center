import {useEffect,useState} from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API.replace('/api','');
const socket=io(SOCKET_URL);
export default function Admin(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();const [live,setLive]=useState([]);const [stats,setStats]=useState({v:0,t:0,w:0});
  useEffect(()=>{
    socket.on('fleet-location',(d)=>{setLive(p=>[...p.slice(-9),d]);});
    axios.get(API+"/fleet/all").then(r=>setStats(s=>({...s,v:r.data.length})));
    axios.get(API+"/trip/all").then(r=>setStats(s=>({...s,t:r.data.length})));
    axios.get(API+"/warehouse/all").then(r=>setStats(s=>({...s,w:r.data.length})));
  },[]);
  return <div style={{padding:20}}><button onClick={toggle}>{dark?'☀️':'🌙'}</button><button onClick={logout} style={{float:'right'}}>Logout</button>
  <h1>Admin Dashboard - Command Center</h1>
  <div style={{display:'flex',gap:12}}><div style={{border:'1px solid #ccc',padding:15}}>Vehicles: {stats.v}</div><div style={{border:'1px solid #ccc',padding:15}}>Trips: {stats.t}</div><div style={{border:'1px solid #ccc',padding:15}}>Warehouses: {stats.w}</div></div>
  <h3>Live Fleet Tracking</h3>{live.map((l,i)=><div key={i}>🚚 {l.driver} - {l.lat.toFixed(4)},{l.lng.toFixed(4)}</div>)}
  <p style={{color:'#22c55e'}}>All systems operational</p></div>;
}
