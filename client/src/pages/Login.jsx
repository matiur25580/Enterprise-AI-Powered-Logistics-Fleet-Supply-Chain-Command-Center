import {useState} from 'react';
import axios from 'axios';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Login(){
  const [f,setF]=useState({email:'',password:'',role:'Admin'});
  const [showPw,setShowPw]=useState(false);
  const {login}=useAuth();const {dark,toggle}=useTheme();const [msg,setMsg]=useState('');
  const bg=dark?'linear-gradient(135deg,#0a1128,#14264d,#1e3a6e)':'linear-gradient(135deg,#dbe7f8,#c3d6f0)';
  const cardBg=dark?'#101d38':'#ffffff', cardBd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const fBg=dark?'#0b152b':'#f4f7fc', fBd=dark?'#2b4570':'#c9d6e8', fTx=dark?'#f1f5f9':'#10203c';
  const input={width:'100%',padding:'13px 14px',margin:'0 0 4px 0',borderRadius:10,border:'1px solid '+fBd,background:fBg,color:fTx,fontSize:15,boxSizing:'border-box',outline:'none'};
  const label={display:'block',fontSize:13,fontWeight:600,color:sub,margin:'12px 0 6px 2px',textAlign:'left'};
  const submit=async(e)=>{e.preventDefault();setMsg('');try{
    const r=await axios.post(API+"/auth/login",f);
    setMsg(r.data.message);login(r.data);window.location.href='/dashboard/'+r.data.role;
  }catch(e){setMsg(e.response?.data?.message||'Login failed');}};
  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:bg,padding:20,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{width:'100%',maxWidth:400,background:cardBg,border:cardBd,borderRadius:18,padding:'30px 28px',boxShadow:'0 24px 70px rgba(0,0,0,0.4)'}}>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={toggle} style={{background:'transparent',border:'1px solid '+fBd,color:text,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:13}}>{dark?'☀️ Light':'🌙 Dark'}</button></div>
      <div style={{textAlign:'center',margin:'4px 0 18px'}}>
        <div style={{fontSize:46}}>🚚</div>
        <h1 style={{margin:'10px 0 4px',fontSize:25,color:text,letterSpacing:0.5}}>FleetCommand</h1>
        <p style={{margin:0,fontSize:13,color:sub}}>Logistics • Fleet • Supply Chain</p>
      </div>
      <h2 style={{color:text,fontSize:18,margin:'0 0 6px',textAlign:'center'}}>Welcome Back</h2>
      <p style={{color:sub,fontSize:13,margin:'0 0 6px',textAlign:'center'}}>Login to your command center</p>
      <form onSubmit={submit}>
        <label style={label}>Account Role</label>
        <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} style={input}>
          <option>Admin</option><option>FleetManager</option><option>WarehouseManager</option><option>Driver</option><option>Client</option><option>Accountant</option>
        </select>
        <label style={label}>Email Address</label>
        <input type="email" placeholder="you@company.com" style={input} onChange={e=>setF({...f,email:e.target.value})} required/>
        <label style={label}>Password</label>
        <div style={{position:'relative'}}>
          <input type={showPw?'text':'password'} placeholder="Enter your password" style={{...input,paddingRight:44}} onChange={e=>setF({...f,password:e.target.value})} required/>
          <span onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',cursor:'pointer',fontSize:18}}>{showPw?'🙈':'👁️'}</span>
        </div>
        <button style={{width:'100%',padding:14,marginTop:16,borderRadius:10,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:800,fontSize:16,cursor:'pointer',boxSizing:'border-box',letterSpacing:0.5}}>LOGIN →</button>
      </form>
      {msg&&<p style={{color:msg.includes('success')?'#22c55e':'#f87171',marginTop:14,textAlign:'center',fontSize:14}}>{msg}</p>}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,fontSize:14}}>
        <a href="/register" style={{color:'#f59e0b',textDecoration:'none',fontWeight:700}}>Create Account</a>
        <a href="/forgot-password" style={{color:sub,textDecoration:'none'}}>Forgot Password?</a>
      </div>
    </div>
  </div>;
}
