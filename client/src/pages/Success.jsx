import {useState} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
export default function Success(){
  const loc=useLocation();const nav=useNavigate();
  const s=loc.state||{};
  const [dark,setDark]=useState(true);
  const bg=dark?'radial-gradient(1200px 600px at 20% -10%,#12305e 0%,#0a1830 55%,#060d1d 100%)':'linear-gradient(135deg,#eef3fa,#dbe7f5)';
  const card=dark?'rgba(16,34,66,.94)':'#ffffff';
  const txt=dark?'#f1f5f9':'#0f172a';
  const sub=dark?'#93a4c4':'#475569';
  const bd=dark?'1px solid rgba(148,163,184,.18)':'1px solid #e2e8f0';
  return(
  <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:bg,padding:16,fontFamily:'system-ui'}}>
    <div style={{width:'100%',maxWidth:440,background:card,border:bd,borderRadius:20,padding:36,boxShadow:'0 20px 60px rgba(0,0,0,.35)',textAlign:'center',position:'relative'}}>
      <button onClick={()=>setDark(!dark)} style={{position:'absolute',top:14,right:14,border:bd,background:'transparent',color:txt,borderRadius:20,padding:'6px 12px',cursor:'pointer',fontSize:13}}>{dark?'☀️ Light':'🌙 Dark'}</button>
      <div style={{fontSize:52}}>🚚</div>
      <h1 style={{color:txt,margin:'8px 0 2px',fontSize:30}}>FleetCommand</h1>
      <p style={{color:sub,margin:'0 0 18px',fontSize:13}}>Logistics • Fleet • Supply Chain</p>
      <div style={{width:76,height:76,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:38,color:'#fff',boxShadow:'0 0 0 10px rgba(22,163,74,.15)'}}>✓</div>
      <h2 style={{color:txt,margin:'0 0 8px'}}>{s.title||'Successful!'}</h2>
      <p style={{color:sub,margin:'0 0 16px',fontSize:14}}>{s.message||'Your request completed successfully.'}</p>
      {s.uid?(
      <div style={{background:dark?'rgba(245,158,11,.12)':'#fef3c7',border:'1px dashed #f59e0b',borderRadius:12,padding:12,marginBottom:18}}>
        <div style={{fontSize:12,color:sub}}>Your Unique ID</div>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:2,color:'#f59e0b',wordBreak:'break-all',overflowWrap:'anywhere',lineHeight:1.5}}>{s.uid}</div>
        <div style={{fontSize:12,color:sub,marginTop:4}}>Save it for future reference</div>
      </div>):null}
      <button onClick={()=>nav(s.to||'/')} style={{width:'100%',padding:14,border:'none',borderRadius:12,background:'#f59e0b',color:'#1a1005',fontWeight:800,fontSize:15,cursor:'pointer'}}>{s.btn||'GO TO LOGIN →'}</button>
      <div style={{marginTop:14}}><Link to="/" style={{color:sub,fontSize:13,textDecoration:'none'}}>← Back to Home</Link></div>
    </div>
  </div>);
}
