import {useState,useEffect} from 'react';import axios from 'axios';import {useAuth} from '../../context/AuthContext';import {useTheme} from '../../context/ThemeContext';
export default function WarehouseManager(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();
  const [list,setList]=useState([]);const [f,setF]=useState({name:'',location:'',totalCapacity:''});const [msg,setMsg]=useState('');
  const load=async()=>{const r=await axios.get('http://localhost:5000/api/warehouse/all');setList(r.data);};
  useEffect(()=>{load();},[]);
  const add=async(e)=>{e.preventDefault();const r=await axios.post('http://localhost:5000/api/warehouse/add',f);setMsg(r.data.message);load();};
  return <div style={{padding:20}}>
    <button onClick={toggle}>{dark?'☀️':'🌙'}</button><button onClick={logout} style={{float:'right'}}>Logout</button>
    <h1>WarehouseManager Dashboard</h1>{msg&&<p style={{color:'#22c55e'}}>{msg}</p>}
    <form onSubmit={add} style={{display:'flex',gap:8}}><input placeholder="Name" onChange={e=>setF({...f,name:e.target.value})} required style={{padding:8}}/><input placeholder="Location" onChange={e=>setF({...f,location:e.target.value})} style={{padding:8}}/><input placeholder="Capacity" onChange={e=>setF({...f,totalCapacity:e.target.value})} style={{padding:8}}/><button style={{background:'#2563eb',color:'#fff',border:0,padding:'8px 16px'}}>Add</button></form>
    <h3>Warehouses ({list.length})</h3>{list.map(w=><div key={w._id} style={{border:'1px solid #ccc',padding:8,margin:'6px 0'}}>{w.name} - {w.location} - Cap: {w.totalCapacity}</div>)}
  </div>;
}
