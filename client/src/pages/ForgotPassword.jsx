import {useState} from 'react';
import axios from 'axios';
import {useTheme} from '../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function ForgotPassword(){
  const {dark,toggle}=useTheme();
  const [email,setEmail]=useState('');const [otp,setOtp]=useState('');const [np,setNp]=useState('');
  const [step,setStep]=useState(1);const [msg,setMsg]=useState('');const [sending,setSending]=useState(false);
  const bg=dark?'linear-gradient(135deg,#0a1128,#14264d,#1e3a6e)':'linear-gradient(135deg,#dbe7f8,#c3d6f0)';
  const cardBg=dark?'#101d38':'#ffffff', cardBd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const fBg=dark?'#0b152b':'#f4f7fc', fBd=dark?'#2b4570':'#c9d6e8', fTx=dark?'#f1f5f9':'#10203c';
  const input={width:'100%',padding:'13px 14px',margin:'0 0 4px 0',borderRadius:10,border:'1px solid '+fBd,background:fBg,color:fTx,fontSize:15,boxSizing:'border-box',outline:'none'};
  const label={display:'block',fontSize:13,fontWeight:600,color:sub,margin:'12px 0 6px 2px',textAlign:'left'};
  const send=async(e)=>{e.preventDefault();setSending(true);setMsg('Sending OTP, please wait...');try{await axios.post(API+"/auth/forgot-password",{email},{timeout:45000});setStep(2);setMsg('OTP sent to your email');}catch(e){setMsg(e.response?.data?.message||'Failed to send OTP');}setSending(false);};
  const reset=async(e)=>{e.preventDefault();try{const r=await axios.post(API+"/auth/reset-password",{email,otp,newPassword:np});setMsg(r.data.message);}catch(e){setMsg(e.response?.data?.message||'Reset failed');}};
  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:bg,padding:20,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{width:'100%',maxWidth:400,background:cardBg,border:cardBd,borderRadius:18,padding:'30px 28px',boxShadow:'0 24px 70px rgba(0,0,0,0.4)'}}>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={toggle} style={{background:'transparent',border:'1px solid '+fBd,color:text,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:13}}>{dark?'☀️ Light':'🌙 Dark'}</button></div>
      <div style={{textAlign:'center',margin:'4px 0 18px'}}>
        <div style={{fontSize:46}}>🔑</div>
        <h1 style={{margin:'10px 0 4px',fontSize:25,color:text,letterSpacing:0.5}}>FleetCommand</h1>
        <p style={{margin:0,fontSize:13,color:sub}}>Logistics • Fleet • Supply Chain</p>
      </div>
      <h2 style={{color:text,fontSize:18,margin:'0 0 6px',textAlign:'center'}}>Reset Password</h2>
      <p style={{color:sub,fontSize:13,margin:'0 0 6px',textAlign:'center'}}>{step===1?'Enter your registered email':'Enter OTP and choose a new password'}</p>
      {step===1?
      <form onSubmit={send}>
        <label style={label}>Registered Email</label>
        <input type="email" placeholder="you@company.com" style={input} onChange={e=>setEmail(e.target.value)} required/>
        <button disabled={sending} style={{width:'100%',padding:14,marginTop:16,borderRadius:10,border:'none',background:sending?'#64748b':'linear-gradient(90deg,#f59e0b,#f97316)',color:sending?'#e2e8f0':'#231303',fontWeight:800,fontSize:16,cursor:sending?'wait':'pointer',boxSizing:'border-box'}}>{sending?'SENDING...':'SEND OTP →'}</button>
      </form>:
      <form onSubmit={reset}>
        <label style={label}>6-Digit OTP</label>
        <input placeholder="Enter OTP from email" inputMode="numeric" style={{...input,textAlign:'center',letterSpacing:4,fontWeight:700}} onChange={e=>setOtp(e.target.value)} required/>
        <label style={label}>New Password</label>
        <input type="password" placeholder="Choose a new password" style={input} onChange={e=>setNp(e.target.value)} required/>
        <button style={{width:'100%',padding:14,marginTop:16,borderRadius:10,border:'none',background:'linear-gradient(90deg,#16a34a,#22c55e)',color:'#fff',fontWeight:800,fontSize:16,cursor:'pointer',boxSizing:'border-box'}}>RESET PASSWORD</button>
      </form>}
      {msg&&<p style={{color:msg.includes('success')||msg.includes('sent')?'#22c55e':'#f87171',marginTop:14,textAlign:'center',fontSize:14}}>{msg}</p>}
      <div style={{textAlign:'center',marginTop:16,fontSize:14}}><a href="/" style={{color:sub,textDecoration:'none'}}>← Back to Login</a></div>
    </div>
  </div>;
}
