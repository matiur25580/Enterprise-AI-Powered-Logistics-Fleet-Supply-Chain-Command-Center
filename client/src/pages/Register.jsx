import {useState,useRef,useEffect} from 'react';import axios from 'axios';import {useTheme} from '../context/ThemeContext';
export default function Register(){
  const {dark,toggle}=useTheme();
  const [f,setF]=useState({fullName:'',email:'',password:'',role:'Client',contactNumber:'',dob:''});
  const [otp,setOtp]=useState(['','','','','','']);const [step,setStep]=useState(1);
  const [timer,setTimer]=useState(300);const [msg,setMsg]=useState('');const refs=useRef([]);
  useEffect(()=>{if(step===2&&timer>0){const t=setTimeout(()=>setTimer(timer-1),1000);return()=>clearTimeout(t);}},[timer,step]);
  const sendOtp=async()=>{try{await axios.post('import.meta.env.VITE_API_URL || 'API'/auth/send-otp',{email:f.email});setStep(2);setTimer(300);setMsg('OTP sent to email');}catch(e){setMsg('OTP send failed');}};
  const handleOtp=(i,v)=>{if(!/^[0-9]?$/.test(v))return;const n=[...otp];n[i]=v;setOtp(n);if(v&&i<5)refs.current[i+1].focus();};
  const register=async(e)=>{e.preventDefault();try{
    const r=await axios.post('import.meta.env.VITE_API_URL || 'API'/auth/register',{...f,otp:otp.join('')});
    setMsg('Registered successfully! Your ID: '+r.data.uniqueId+' - Save for future reference');
  }catch(e){setMsg(e.response?.data?.message||'Error');}};
  return <div style={{padding:40,maxWidth:450,margin:'auto'}}>
    <button onClick={toggle}>{dark?'☀️ Light':'🌙 Dark'}</button><h2>Register</h2>
    {step===1?<form onSubmit={(e)=>{e.preventDefault();sendOtp();}}>
      <input placeholder="Full Name" style={{width:'100%',padding:10,margin:'6px 0'}} onChange={e=>setF({...f,fullName:e.target.value})} required/>
      <input placeholder="Email" style={{width:'100%',padding:10,margin:'6px 0'}} onChange={e=>setF({...f,email:e.target.value})} required/>
      <input placeholder="Contact" style={{width:'100%',padding:10,margin:'6px 0'}} onChange={e=>setF({...f,contactNumber:e.target.value})} required/>
      <input placeholder="DOB DDMMYYYY" style={{width:'100%',padding:10,margin:'6px 0'}} onChange={e=>setF({...f,dob:e.target.value})} required/>
      <input type="password" placeholder="Password" style={{width:'100%',padding:10,margin:'6px 0'}} onChange={e=>setF({...f,password:e.target.value})} required/>
      <select onChange={e=>setF({...f,role:e.target.value})} style={{width:'100%',padding:10,margin:'6px 0'}}><option>Admin</option><option>FleetManager</option><option>WarehouseManager</option><option>Driver</option><option>Client</option></select>
      <button style={{width:'100%',padding:12,background:'#2563eb',color:'#fff',border:0}}>Send OTP</button>
    </form>:
    <form onSubmit={register}>
      <div style={{display:'flex',gap:8,justifyContent:'center',margin:'15px 0'}}>
        {otp.map((d,i)=><input key={i} ref={el=>refs.current[i]=el} value={d} onChange={e=>handleOtp(i,e.target.value)} maxLength={1} style={{width:45,height:50,textAlign:'center',fontSize:20}}/>)}
      </div>
      <p>Time left: {Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</p>
      {timer===0&&<button type="button" onClick={sendOtp} style={{marginBottom:10}}>Resend OTP</button>}
      <button style={{width:'100%',padding:12,background:'#16a34a',color:'#fff',border:0}}>Verify & Register</button>
    </form>}
    {msg&&<p style={{color:msg.includes('success')?'#22c55e':'#2563eb',marginTop:12}}>{msg}</p>}
    <a href="/">Back to Login</a>
  </div>;
}
