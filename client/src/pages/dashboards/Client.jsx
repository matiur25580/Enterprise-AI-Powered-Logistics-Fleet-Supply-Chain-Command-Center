import {useState,useEffect} from 'react';import axios from 'axios';import {useAuth} from '../../context/AuthContext';import {useTheme} from '../../context/ThemeContext';
export default function Client(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();
  const [f,setF]=useState({clientName:'',from:'',to:'',goods:'',weight:''});const [list,setList]=useState([]);const [msg,setMsg]=useState('');
  const load=async()=>{const r=await axios.get('import.meta.env.VITE_API_URL || 'API'/booking/all');setList(r.data);};
  useEffect(()=>{load();},[]);
  const book=async(e)=>{e.preventDefault();const r=await axios.post('import.meta.env.VITE_API_URL || 'API'/booking/create',f);setMsg(r.data.message);load();};
  const dl=(id,inv)=>{window.open(`import.meta.env.VITE_API_URL || 'API'/booking/invoice/${id}`,'_blank');};
  return <div style={{padding:20}}><button onClick={toggle}>{dark?'☀️':'🌙'}</button><button onClick={logout} style={{float:'right'}}>Logout</button>
  <h1>Client Dashboard</h1>{msg&&<p style={{color:'#22c55e'}}>{msg}</p>}
  <h3>New Booking</h3><form onSubmit={book} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
  <input placeholder="Your Name" onChange={e=>setF({...f,clientName:e.target.value})} required style={{padding:8}}/>
  <input placeholder="From" onChange={e=>setF({...f,from:e.target.value})} required style={{padding:8}}/>
  <input placeholder="To" onChange={e=>setF({...f,to:e.target.value})} required style={{padding:8}}/>
  <input placeholder="Goods" onChange={e=>setF({...f,goods:e.target.value})} style={{padding:8}}/>
  <input placeholder="Weight" onChange={e=>setF({...f,weight:e.target.value})} style={{padding:8}}/>
  <button style={{background:'#2563eb',color:'#fff',border:0,padding:'8px 16px'}}>Book</button></form>
  <h3>My Bookings ({list.length})</h3>{list.map(b=><div key={b._id} style={{border:'1px solid #ccc',padding:8,margin:'6px 0'}}>{b.invoiceNo} - {b.from} to {b.to} - {b.status} <button onClick={()=>dl(b._id)} style={{marginLeft:10}}>Download Invoice PDF</button></div>)}
  </div>;
}
