import {useEffect,useState} from 'react';
const API=(import.meta.env&&import.meta.env.VITE_API_URL)||'http://localhost:5000/api';
function getEmail(){
  const keys=['user','authUser','auth','fleetUser','fleet_user'];
  for(const k of keys){
    try{ const raw=localStorage.getItem(k); if(!raw) continue;
      const o=JSON.parse(raw); const em=o&&(o.email||(o.user&&o.user.email));
      if(em) return em;
    }catch(e){}
  }
  return '';
}
export default function NotifBell(){
  const [items,setItems]=useState([]);
  const [alerts,setAlerts]=useState([]);
  const [open,setOpen]=useState(false);
  const email=getEmail();
  const load=async()=>{
    if(!email) return;
    try{ const r=await fetch(API+'/notifications/my?email='+encodeURIComponent(email));
      const d=await r.json(); setItems(Array.isArray(d)?d:[]); }catch(e){}
    try{ const r2=await fetch(API+'/documents/expiring/list?days=15');
      const d2=await r2.json(); setAlerts(Array.isArray(d2)?d2:[]); }catch(e){}
  };
  useEffect(()=>{ load(); const t=setInterval(load,30000); return ()=>clearInterval(t); },[]);
  const unread=items.filter(i=>!i.read).length;
  const markAll=async()=>{ try{ await fetch(API+'/notifications/read-all?email='+encodeURIComponent(email),{method:'PUT'}); load(); }catch(e){} };
  return (<div style={{position:'relative',display:'inline-block'}}>
    <button onClick={()=>setOpen(!open)} style={{background:'#1e293b',color:'#fff',border:'1px solid #334155',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:16}}>&#128276;{unread>0 && <span style={{background:'#ef4444',borderRadius:10,padding:'0 6px',fontSize:11,marginLeft:4}}>{unread}</span>}</button>
    {open && (<div style={{position:'absolute',right:0,top:42,width:320,maxHeight:380,overflowY:'auto',background:'#0f172a',border:'1px solid #334155',borderRadius:10,zIndex:50,padding:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <b style={{color:'#fff'}}>Notifications</b>
        <button onClick={markAll} style={{background:'transparent',color:'#38bdf8',border:'none',cursor:'pointer',fontSize:12}}>Mark all read</button>
      </div>
      {alerts.length>0 && (<div style={{marginBottom:8}}>
        <div style={{color:'#fbbf24',fontSize:12,marginBottom:4}}>Document alerts ({alerts.length} vehicles)</div>
        {alerts.slice(0,5).map(v=>(<div key={v._id} style={{color:'#fca5a5',fontSize:12,padding:'4px 0'}}>{v.vehicleNo}: {v.expiring.map(e=>e.name+(e.overdue?' (OVERDUE)':'')).join(', ')}</div>))}
      </div>)}
      {items.length===0 && alerts.length===0 && <div style={{color:'#94a3b8',fontSize:13}}>No notifications</div>}
      {items.map(n=>(<div key={n._id} style={{padding:'8px 4px',borderBottom:'1px solid #1e293b',opacity:n.read?0.6:1}}>
        <div style={{color:'#fff',fontSize:13,fontWeight:n.read?400:700}}>{n.title}</div>
        <div style={{color:'#94a3b8',fontSize:12}}>{n.message}</div>
        <div style={{color:'#64748b',fontSize:11}}>{new Date(n.createdAt).toLocaleString()}</div>
      </div>))}
    </div>)}
  </div>);
}
