import {useEffect,useState} from 'react';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Client(){
  const {user,logout}=useAuth(); const {dark,toggle}=useTheme();
  const [f,setF]=useState({clientName:'',email:'',from:'',to:'',goods:'',weight:''});
  const [list,setList]=useState([]); const [msg,setMsg]=useState('');
  const bg=dark?'#0a1128':'#eef2f9', card=dark?'#101d38':'#ffffff';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const inp={width:'100%',padding:'10px 12px',margin:'0 0 8px 0',borderRadius:8,border:bd,background:dark?'#0b152b':'#f4f7fc',color:text,boxSizing:'border-box',fontSize:14};
  const btn={padding:'10px 16px',borderRadius:8,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:700,cursor:'pointer',fontSize:14};
  const load=async()=>{try{const r=await axios.get(API+'/booking/all');setList(r.data||[]);}catch(e){console.error(e);}};
  useEffect(()=>{load();},[]);
  const ok=(m)=>{setMsg(m);setTimeout(()=>setMsg(''),3500);};
  const book=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/booking/create',f);ok(r.data.message);
    setF({clientName:'',email:'',from:'',to:'',goods:'',weight:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const badge=(s)=>{const c=s==='Delivered'?'#22c55e':s==='OnGoing'?'#f59e0b':s==='Cancelled'?'#dc2626':'#3b82f6';
    return <span style={{background:c+'22',color:c,padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>{s||'Pending'}</span>;};
  const my=list.filter(b=>!user||!user.fullName||(b.clientName||'').toLowerCase()===(user.fullName||'').toLowerCase());
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <h1 style={{margin:0,fontSize:21}}>Client Dashboard</h1>
      <div><button onClick={toggle} style={{...btn,background:card,color:text,border:bd,marginRight:8}}>{dark?'Light':'Dark'}</button>
      <button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button></div>
    </div>
    {msg&&<div style={{background:card,border:bd,borderRadius:8,padding:10,marginBottom:12,textAlign:'center',fontSize:14}}>{msg}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
      {[['Total Bookings',list.length],['My Bookings',my.length],['Delivered',list.filter(b=>b.status==='Delivered').length],['In Transit',list.filter(b=>b.status==='OnGoing').length]].map(s=>(
        <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:14,textAlign:'center'}}>
          <div style={{fontSize:13,color:sub}}>{s[0]}</div>
          <div style={{fontSize:26,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
        </div>))}
    </div>
    <div style={{background:card,border:bd,borderRadius:12,padding:16,marginBottom:14}}>
      <h3 style={{marginTop:0}}>New Booking</h3>
      <form onSubmit={book} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}>
        <input type="email" placeholder="Email for notifications (optional)" value={f.email} onChange={e=>setF({...f,email:e.target.value})} style={inp}/>
        <input placeholder="Your Name" value={f.clientName} onChange={e=>setF({...f,clientName:e.target.value})} style={inp} required/>
        <input placeholder="From" value={f.from} onChange={e=>setF({...f,from:e.target.value})} style={inp} required/>
        <input placeholder="To" value={f.to} onChange={e=>setF({...f,to:e.target.value})} style={inp} required/>
        <input placeholder="Goods" value={f.goods} onChange={e=>setF({...f,goods:e.target.value})} style={inp}/>
        <input placeholder="Weight" value={f.weight} onChange={e=>setF({...f,weight:e.target.value})} style={inp}/>
        <button style={btn}>Book Shipment</button>
      </form>
    </div>
    <div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Bookings ({list.length})</h3>
      {list.map(b=>(
        <div key={b._id} style={{border:bd,borderRadius:10,padding:12,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{b.invoiceNo} - {b.from} to {b.to}</div>
            <div style={{fontSize:13,color:sub}}>{b.clientName} | {b.goods||'-'} | {b.weight||'-'}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {badge(b.status)}
            <button onClick={()=>window.open(API+'/booking/invoice/'+b._id,'_blank')} style={{...btn,padding:'6px 12px',fontSize:12}}>Invoice PDF</button>
          </div>
        </div>))}
      {list.length===0&&<p style={{color:sub,textAlign:'center'}}>No bookings yet. Create your first shipment above.</p>}
    </div>
  </div>);
}
