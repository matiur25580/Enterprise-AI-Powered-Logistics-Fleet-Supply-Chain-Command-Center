import {useState,useRef,useEffect} from 'react';
import axios from 'axios';
import {useTheme} from '../context/ThemeContext';
import {useNavigate} from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Register(){
  const nav=useNavigate();
  const {dark,toggle}=useTheme();
  const [f,setF]=useState({fullName:'',email:'',password:'',role:'Client',contactNumber:'',dob:''});
  const [cpw,setCpw]=useState('');
  const [otp,setOtp]=useState(['','','','','','']);const [step,setStep]=useState(1);
  const [timer,setTimer]=useState(300);const [msg,setMsg]=useState('');
  const [sending,setSending]=useState(false);const refs=useRef([]);
  const bg=dark?'linear-gradient(135deg,#0a1128,#14264d,#1e3a6e)':'linear-gradient(135deg,#dbe7f8,#c3d6f0)';
  const cardBg=dark?'#101d38':'#ffffff', cardBd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const fBg=dark?'#0b152b':'#f4f7fc', fBd=dark?'#2b4570':'#c9d6e8', fTx=dark?'#f1f5f9':'#10203c';
  const input={width:'100%',padding:'13px 14px',margin:'0 0 4px 0',borderRadius:10,border:'1px solid '+fBd,background:fBg,color:fTx,fontSize:15,boxSizing:'border-box',outline:'none'};
  const label={display:'block',fontSize:13,fontWeight:600,color:sub,margin:'12px 0 6px 2px',textAlign:'left'};
  useEffect(()=>{if(step===2&&timer>0){const t=setTimeout(()=>setTimer(timer-1),1000);return()=>clearTimeout(t);}},[timer,step]);
  const sendOtp=async()=>{
    if(sending) return;
    if(!f.email){setMsg('Please enter email first');return;}
    if(f.password!==cpw){setMsg('Password and Confirm Password do not match');return;}
    setSending(true);setMsg('Sending OTP, please wait...');
    try{await axios.post(API+"/auth/send-otp",{email:f.email,role:f.role},{timeout:45000});setStep(2);setTimer(300);setMsg('OTP sent to your email');}
    catch(e){setMsg('Error: '+(e.response?.data?.message||e.message||'OTP send failed'));}
    setSending(false);
  };
  const handleOtp=(i,v)=>{if(!/^[0-9]?$/.test(v))return;const n=[...otp];n[i]=v;setOtp(n);if(v&&i<5)refs.current[i+1].focus();};
  const register=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+"/auth/register",{...f,otp:otp.join('')});
    nav('/success',{state:{title:'Registration Successful!',message:'Your FleetCommand account has been created.',uid:r.data.uniqueId,to:'/'}})
  }catch(e){setMsg(e.response?.data?.message||'Registration failed');}};
  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:bg,padding:20,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{width:'100%',maxWidth:420,background:cardBg,border:cardBd,borderRadius:18,padding:'30px 28px',boxShadow:'0 24px 70px rgba(0,0,0,0.4)'}}>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={toggle} style={{background:'transparent',border:'1px solid '+fBd,color:text,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:13}}>{dark?'☀️ Light':'🌙 Dark'}</button></div>
      <div style={{textAlign:'center',margin:'4px 0 18px'}}>
        <div style={{fontSize:46}}>🚚</div>
        <h1 style={{margin:'10px 0 4px',fontSize:25,color:text,letterSpacing:0.5}}>FleetCommand</h1>
        <p style={{margin:0,fontSize:13,color:sub}}>Logistics • Fleet • Supply Chain</p>
      </div>
      <h2 style={{color:text,fontSize:18,margin:'0 0 6px',textAlign:'center'}}>{step===1?'Create Account':'Verify Email'}</h2>
      <p style={{color:sub,fontSize:13,margin:'0 0 6px',textAlign:'center'}}>{step===1?'Join the fleet network':'Enter the 6-digit code sent to your email'}</p>
      {step===1?
      <form onSubmit={(e)=>{e.preventDefault();sendOtp();}}>
        <label style={label}>Full Name</label>
        <input placeholder="e.g. Matiur Rahaman" style={input} onChange={e=>setF({...f,fullName:e.target.value})} required/>
        <label style={label}>Email Address</label>
        <input type="email" placeholder="you@company.com" style={input} onChange={e=>setF({...f,email:e.target.value})} required/>
        <label style={label}>Contact Number</label>
        <input placeholder="e.g. 9674598687" style={input} onChange={e=>setF({...f,contactNumber:e.target.value})} required/>
        <label style={label}>Date of Birth (DDMMYYYY)</label>
        <input placeholder="e.g. 29081998" style={input} onChange={e=>setF({...f,dob:e.target.value})} required/>
        <label style={label}>Password</label>
        <input type="password" placeholder="Choose a strong password" style={input} onChange={e=>setF({...f,password:e.target.value})} required/>
        <label style={label}>Confirm Password</label>
        <input type="password" placeholder="Re-enter your password" style={input} onChange={e=>setCpw(e.target.value)} required/>
        <label style={label}>Account Role</label>
        <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} style={input}><option>Admin</option><option>FleetManager</option><option>WarehouseManager</option><option>Driver</option><option>Client</option></select>
        <button disabled={sending} style={{width:'100%',padding:14,marginTop:16,borderRadius:10,border:'none',background:sending?'#64748b':'linear-gradient(90deg,#f59e0b,#f97316)',color:sending?'#e2e8f0':'#231303',fontWeight:800,fontSize:16,cursor:sending?'wait':'pointer',boxSizing:'border-box'}}>{sending?'SUBMITTING...':'SUBMIT →'}</button>
      </form>:
      <form onSubmit={register}>
        <div style={{display:'flex',gap:8,justifyContent:'center',margin:'18px 0'}}>
          {otp.map((d,i)=><input key={i} ref={el=>refs.current[i]=el} value={d} onChange={e=>handleOtp(i,e.target.value)} maxLength={1} inputMode="numeric" style={{width:46,height:54,textAlign:'center',fontSize:22,fontWeight:700,borderRadius:10,border:'1px solid '+fBd,background:fBg,color:fTx,boxSizing:'border-box',outline:'none'}}/>)}
        </div>
        <p style={{color:sub,textAlign:'center',fontSize:14}}>Code expires in <b style={{color:'#f59e0b'}}>{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</b></p>
        {timer===0&&<button type="button" onClick={sendOtp} style={{width:'100%',padding:12,marginBottom:10,borderRadius:10,border:'1px solid #f59e0b',background:'transparent',color:'#f59e0b',fontWeight:700,cursor:'pointer',boxSizing:'border-box'}}>RESEND OTP</button>}
        <button style={{width:'100%',padding:14,borderRadius:10,border:'none',background:'linear-gradient(90deg,#16a34a,#22c55e)',color:'#fff',fontWeight:800,fontSize:16,cursor:'pointer',boxSizing:'border-box'}}>VERIFY & CREATE ACCOUNT</button>
      </form>}
      {msg&&<p style={{color:msg.includes('success')||msg.includes('sent')?'#22c55e':'#f87171',marginTop:14,textAlign:'center',fontSize:14}}>{msg}</p>}
      <div style={{textAlign:'center',marginTop:16,fontSize:14}}><a href="/login" style={{color:sub,textDecoration:'none'}}>← Back to Login</a></div>
    </div>
  </div>;
}
