import {useState} from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function ForgotPassword(){
  const [email,setEmail]=useState('');const [otp,setOtp]=useState('');const [np,setNp]=useState('');
  const [step,setStep]=useState(1);const [msg,setMsg]=useState('');
  const send=async(e)=>{e.preventDefault();try{await axios.post(API+"/auth/forgot-password",{email});setStep(2);setMsg('OTP sent to email');}catch(e){setMsg(e.response?.data?.message||'Error');}};
  const reset=async(e)=>{e.preventDefault();try{const r=await axios.post(API+"/auth/reset-password",{email,otp,newPassword:np});setMsg(r.data.message);}catch(e){setMsg(e.response?.data?.message||'Error');}};
  return <div style={{padding:40,maxWidth:400,margin:'auto'}}><h2>Forgot Password</h2>
  {step===1?<form onSubmit={send}><input placeholder="Registered Email" style={{width:'100%',padding:10,margin:'8px 0'}} onChange={e=>setEmail(e.target.value)} required/><button style={{width:'100%',padding:12,background:'#2563eb',color:'#fff',border:0}}>Send OTP</button></form>:
  <form onSubmit={reset}><input placeholder="6-digit OTP" style={{width:'100%',padding:10,margin:'8px 0'}} onChange={e=>setOtp(e.target.value)} required/><input type="password" placeholder="New Password" style={{width:'100%',padding:10,margin:'8px 0'}} onChange={e=>setNp(e.target.value)} required/><button style={{width:'100%',padding:12,background:'#16a34a',color:'#fff',border:0}}>Reset Password</button></form>}
  {msg&&<p style={{color:msg.includes('success')?'#22c55e':'#2563eb'}}>{msg}</p>}
  <a href="/">Back to Login</a></div>;
}
