import {useState} from 'react';
import axios from 'axios';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Login(){
  const [f,setF]=useState({email:'',password:'',role:'Admin'});
  const {login}=useAuth();const {dark,toggle}=useTheme();const [msg,setMsg]=useState('');
  const submit=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+"/auth/login",f);
    setMsg(r.data.message);login(r.data);window.location.href='/dashboard/'+r.data.role;
  }catch(e){setMsg(e.response?.data?.message||'Error');}};
  return <div style={{padding:40,maxWidth:400,margin:'auto'}}>
    <button onClick={toggle}>{dark?'☀️ Light':'🌙 Dark'}</button>
    <h2>Logistics Login</h2>
    <form onSubmit={submit}>
      <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} style={{width:'100%',margin:'8px 0',padding:10}}>
        <option>Admin</option><option>FleetManager</option><option>WarehouseManager</option><option>Driver</option><option>Client</option>
      </select>
      <input placeholder="Email" style={{width:'100%',padding:10,margin:'8px 0'}} onChange={e=>setF({...f,email:e.target.value})} required/>
      <input type="password" placeholder="Password" style={{width:'100%',padding:10,margin:'8px 0'}} onChange={e=>setF({...f,password:e.target.value})} required/>
      <button style={{width:'100%',padding:12,background:'#2563eb',color:'#fff',border:0}}>Login</button>
    </form>
    {msg&&<p style={{color:msg.includes('success')?'#22c55e':'red'}}>{msg}</p>}
    <a href="/register">Register</a>
  </div>;
}
