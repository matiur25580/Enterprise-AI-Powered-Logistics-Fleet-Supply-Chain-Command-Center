import {useEffect,useState} from 'react';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from '../../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function WarehouseManager(){
  const {logout}=useAuth(); const {dark,toggle}=useTheme();
  const [list,setList]=useState([]); const [managers,setManagers]=useState([]);
  const [f,setF]=useState({name:'',location:'',totalCapacity:'',manager:''});
  const [msg,setMsg]=useState('');
  const [stockEdits,setStockEdits]=useState({});
  const bg=dark?'#0a1128':'#eef2f9', card=dark?'#101d38':'#ffffff';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const inp={width:'100%',padding:'10px 12px',margin:'0 0 8px 0',borderRadius:8,border:bd,background:dark?'#0b152b':'#f4f7fc',color:text,boxSizing:'border-box',fontSize:14};
  const btn={padding:'10px 16px',borderRadius:8,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:700,cursor:'pointer',fontSize:14};
  const th={textAlign:'left',padding:'10px',borderBottom:bd,color:sub,fontSize:12,textTransform:'uppercase',whiteSpace:'nowrap'};
  const td={padding:'10px',borderBottom:bd,fontSize:14,whiteSpace:'nowrap'};
  const load=async()=>{
    const g=async(u)=>{try{const r=await axios.get(API+u);return r.data||[];}catch(e){return [];}};
    setList(await g('/warehouse/all'));
    setManagers(await g('/auth/by-role/WarehouseManager'));
  };
  useEffect(()=>{load();},[]);
  const ok=(m)=>{setMsg(m);setTimeout(()=>setMsg(''),3500);};
  const saveStock=async(id)=>{try{
    const v=stockEdits[id];if(v===undefined||v===''){ok('Enter a stock value');return;}
    const r=await axios.put(API+'/warehouse/stock/'+id,{usedCapacity:Number(v)});
    ok(r.data.message);setStockEdits(s=>{const n={...s};delete n[id];return n;});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const add=async(e)=>{e.preventDefault();try{
    const r=await axios.post(API+'/warehouse/add',f);ok(r.data.message);
    setF({name:'',location:'',totalCapacity:'',manager:''});load();
  }catch(e){ok(e.response?.data?.message||e.message);}};
  const totCap=list.reduce((s,w)=>s+(Number(w.totalCapacity)||0),0);
  const totUsed=list.reduce((s,w)=>s+(Number(w.usedCapacity)||0),0);
  const util=totCap?Math.round(totUsed/totCap*100):0;
  const bar=(w)=>{const pct=w.totalCapacity?Math.min(100,Math.round((w.usedCapacity||0)/w.totalCapacity*100)):0;
    const c=pct>85?'#dc2626':pct>60?'#f59e0b':'#22c55e';
    return <div style={{marginTop:6}}><div style={{height:8,background:dark?'#0b152b':'#e5eaf2',borderRadius:4,minWidth:90}}>
      <div style={{height:8,width:pct+'%',background:c,borderRadius:4}}/></div>
      <small style={{color:sub}}>{pct}% utilized</small></div>;};
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 style={{margin:0,fontSize:21}}>Warehouse Manager Dashboard</h1><span style={{background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:800,fontSize:11,padding:'5px 14px',borderRadius:20,letterSpacing:1.5}}>WAREHOUSE MANAGER</span></div>
      <div><button onClick={toggle} style={{...btn,background:card,color:text,border:bd,marginRight:8}}>{dark?'Light':'Dark'}</button>
      <button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button></div>
    </div>
    {msg&&<div style={{background:card,border:bd,borderRadius:8,padding:10,marginBottom:12,textAlign:'center',fontSize:14}}>{msg}</div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
      {[['Warehouses',list.length],['Total Capacity',totCap],['Space Used',totUsed],['Utilization',util+'%']].map(s=>(
        <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:14,textAlign:'center'}}>
          <div style={{fontSize:13,color:sub}}>{s[0]}</div>
          <div style={{fontSize:26,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
        </div>))}
    </div>
    <div style={{background:card,border:bd,borderRadius:12,padding:16}}>
      <h3 style={{marginTop:0}}>Add Warehouse</h3>
      <form onSubmit={add} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:14}}>
        <input placeholder="Warehouse Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} style={inp} required/>
        <input placeholder="Location" value={f.location} onChange={e=>setF({...f,location:e.target.value})} style={inp}/>
        <input type="number" placeholder="Total Capacity" value={f.totalCapacity} onChange={e=>setF({...f,totalCapacity:e.target.value})} style={inp} required/>
        <select value={f.manager} onChange={e=>setF({...f,manager:e.target.value})} style={inp}>
          <option value="">Assign Manager (optional)</option>
          {managers.map(m=><option key={m._id} value={m._id}>{m.fullName}</option>)}
        </select>
        <button style={btn}>+ Add Warehouse</button>
      </form>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th style={th}>Name</th><th style={th}>Location</th><th style={th}>Stock</th><th style={th}>Manager</th></tr></thead>
        <tbody>{list.map(w=>(
          <tr key={w._id}>
            <td style={td}><b>{w.name}</b></td><td style={td}>{w.location||'-'}</td>
            <td style={td}>{w.usedCapacity||0} / {w.totalCapacity}{bar(w)}
              <div style={{display:'flex',gap:6,marginTop:8,alignItems:'center'}}>
                <input type="number" min="0" max={w.totalCapacity} placeholder="Set stock"
                  value={stockEdits[w._id]!==undefined?stockEdits[w._id]:''}
                  onChange={e=>setStockEdits(s=>({...s,[w._id]:e.target.value}))}
                  style={{...inp,margin:0,width:110,padding:'6px 8px',fontSize:12}}/>
                <button onClick={()=>saveStock(w._id)} style={{...btn,padding:'6px 12px',fontSize:12}}>Update</button>
              </div></td>
            <td style={td}>{(w.manager&&w.manager.fullName)||'-'}</td>
          </tr>))}
        </tbody></table></div>
      {list.length===0&&<p style={{color:sub,textAlign:'center'}}>No warehouses yet. Add your first warehouse above.</p>}
    </div>
  </div>);
}
