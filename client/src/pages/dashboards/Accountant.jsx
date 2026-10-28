import {useEffect,useState} from 'react';
import AXX from "axios";
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function Accountant(){
const[dark,setDark]=useState(()=>{try{return localStorage.getItem('fc-theme')==='dark'}catch(e){return false}});
const[list,setList]=useState([]);const[msg,setMsg]=useState('');const[flt,setFlt]=useState('All');const[ed,setEd]=useState({});const[now,setNow]=useState(new Date());
useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]);
const toggle=()=>{const v=!dark;setDark(v);try{localStorage.setItem('fc-theme',v?'dark':'light')}catch(e){}};
const logout=()=>{try{localStorage.clear();sessionStorage.clear()}catch(e){};window.location.href='/login'};
const token=(()=>{try{return localStorage.getItem('token')||sessionStorage.getItem('token')}catch(e){return null}})();
const H=token?{headers:{Authorization:'Bearer '+token}}:{};
const bg=dark?'#0a1128':'#eef2f9',card=dark?'#101d38':'#fff',text=dark?'#eef3fb':'#0f1e38',sub=dark?'#93a7c9':'#5b6b87',bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
const inp={padding:'8px 10px',borderRadius:8,border:bd,background:dark?'#0b152b':'#f4f7fc',color:text,boxSizing:'border-box',fontSize:13};
const btn={padding:'9px 15px',borderRadius:8,border:'none',background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:700,cursor:'pointer',fontSize:13};
const th={textAlign:'left',padding:'9px',borderBottom:bd,color:sub,fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap'};
const td={padding:'9px',borderBottom:bd,fontSize:13,whiteSpace:'nowrap'};
const load=async()=>{try{let r;try{r=await AXX.get(API+'/booking/all',H)}catch(e){r=await AXX.get(API+'/booking',H)}const d=r.data;setList(Array.isArray(d)?d:(d.bookings||d.data||[]))}catch(e){}};
useEffect(()=>{load()},[]);
const ok=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000)};
const save=async b=>{const e=ed[b._id]||{},pl={};if(e.a!==undefined&&e.a!=='')pl.amount=Number(e.a);if(e.p)pl.paymentStatus=e.p;if(!Object.keys(pl).length)return ok('Nothing to update');try{const r=await AXX.put(API+'/booking/billing/'+b._id,pl,H);ok(r.data.message||'Saved');setEd(s=>{const n={...s};delete n[b._id];return n});load()}catch(x){ok((x.response&&x.response.data&&x.response.data.message)||x.message)}};
const paid=list.filter(b=>(b.paymentStatus||'Unpaid')==='Paid'),unpaid=list.filter(b=>(b.paymentStatus||'Unpaid')!=='Paid');
const rev=paid.reduce((s,b)=>s+(Number(b.amount)||0),0),due=unpaid.reduce((s,b)=>s+(Number(b.amount)||0),0);
const fL=list.filter(b=>flt==='All'||(b.paymentStatus||'Unpaid')===flt);
const badge=s=>{const c=s==='Paid'?'#22c55e':s==='Partial'?'#f59e0b':'#dc2626';return <span style={{background:c+'22',color:c,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700}}>{s}</span>};
const p2=n=>String(n).padStart(2,'0');
const dstr=p2(now.getDate())+'.'+p2(now.getMonth()+1)+'.'+now.getFullYear();
let hh=now.getHours();const ap=hh>=12?'PM':'AM';hh=hh%12||12;
const tstr=p2(hh)+'.'+p2(now.getMinutes())+'.'+p2(now.getSeconds())+' '+ap;
return(<div style={{minHeight:'100vh',background:bg,color:text,padding:14,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
<div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 style={{margin:0,fontSize:20}}>Finance Dashboard</h1><span style={{background:'linear-gradient(90deg,#f59e0b,#f97316)',color:'#231303',fontWeight:800,fontSize:11,padding:'4px 13px',borderRadius:20,letterSpacing:1.5}}>ACCOUNTANT</span><span style={{fontSize:12,color:sub}}>{dstr} | {tstr}</span></div>
<div style={{display:'flex',alignItems:'center',gap:8}}>
<button onClick={toggle} title="Toggle theme" style={{width:38,height:38,borderRadius:'50%',border:bd,background:card,fontSize:17,cursor:'pointer',color:text}}>{dark?'\u2600\uFE0F':'\uD83C\uDF19'}</button>
<button onClick={logout} style={{...btn,background:'#dc2626',color:'#fff'}}>Logout</button></div></div>
{msg&&<div style={{background:card,border:bd,borderRadius:8,padding:9,marginBottom:10,textAlign:'center',fontSize:13}}>{msg}</div>}
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:9,marginBottom:12}}>
{[['Revenue',rev],['Pending',due],['Invoices',list.length],['Paid',paid.length],['Unpaid',unpaid.length]].map(s=><div key={s[0]} style={{background:card,border:bd,borderRadius:11,padding:12,textAlign:'center'}}><div style={{fontSize:12,color:sub}}>{s[0]}</div><div style={{fontSize:22,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div></div>)}
</div>
<div style={{background:card,border:bd,borderRadius:12,padding:14}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9,flexWrap:'wrap',gap:8}}><h3 style={{margin:0}}>Invoices ({fL.length})</h3>
<select value={flt} onChange={e=>setFlt(e.target.value)} style={{...inp,width:130}}>{['All','Paid','Unpaid','Partial'].map(x=><option key={x} value={x}>{x}</option>)}</select></div>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Invoice','Client','Route','Amount','Status','Date',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
<tbody>{fL.map(b=><tr key={b._id}>
<td style={td}><b>{b.invoiceNo}</b></td><td style={td}>{b.clientName||'-'}</td><td style={td}>{b.from} to {b.to}</td>
<td style={td}><input type="number" min="0" placeholder={String(b.amount||0)} value={(ed[b._id]||{}).a||''} onChange={e=>setEd(s=>({...s,[b._id]:{...s[b._id],a:e.target.value}}))} style={{...inp,width:95}}/></td>
<td style={td}><select value={(ed[b._id]||{}).p||b.paymentStatus||'Unpaid'} onChange={e=>setEd(s=>({...s,[b._id]:{...s[b._id],p:e.target.value}}))} style={{...inp,width:105}}>{['Unpaid','Partial','Paid'].map(x=><option key={x} value={x}>{x}</option>)}</select><div style={{marginTop:3}}>{badge(b.paymentStatus||'Unpaid')}</div></td>
<td style={td}>{b.createdAt?new Date(b.createdAt).toLocaleDateString():'-'}</td>
<td style={td}><button onClick={()=>save(b)} style={{...btn,padding:'6px 11px',fontSize:12}}>Save</button></td>
</tr>)}</tbody></table></div>
{fL.length===0&&<p style={{color:sub,textAlign:'center'}}>No invoices found.</p>}
</div></div>);}
