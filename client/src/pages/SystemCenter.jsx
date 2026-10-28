import {useEffect,useState} from 'react';
import NotifBell from '../components/NotifBell';
import {exportPDF} from '../utils/pdf';
const API=(import.meta.env&&import.meta.env.VITE_API_URL)||'http://localhost:5000/api';
const th={padding:8,borderBottom:'1px solid #334155',textAlign:'left',color:'#94a3b8',fontSize:12};
const td={padding:8,borderBottom:'1px solid #1e293b',color:'#e2e8f0',fontSize:13};
const inp={padding:8,borderRadius:8,border:'1px solid #334155',background:'#0f172a',color:'#fff',margin:4};
const btn={padding:'8px 14px',borderRadius:8,border:'none',background:'#38bdf8',color:'#082f49',fontWeight:700,cursor:'pointer',margin:4};
function getUser(){try{const ks=['user','authUser','auth','fleetUser','fleet_user'];
for(const k of ks){const r=localStorage.getItem(k);if(!r)continue;const o=JSON.parse(r);
if(o&&(o.email||o.role))return{email:o.email||(o.user&&o.user.email)||'',role:o.role||(o.user&&o.user.role)||''};}}catch(e){}
return{email:'',role:''};}
export default function SystemCenter(){
const me=getUser();
const[tab,setTab]=useState('docs');
const[audit,setAudit]=useState([]);const[docs,setDocs]=useState([]);
const[vehicles,setVehicles]=useState([]);const[fuelHist,setFuelHist]=useState([]);
const[due,setDue]=useState([]);const[docEdit,setDocEdit]=useState({});
const[form,setForm]=useState({vehicle:'',liters:'',cost:'',odometer:'',note:''});
const[svc,setSvc]=useState({vehicle:'',nextServiceDue:'',odometer:''});
const loadAudit=async()=>{try{const r=await fetch(API+'/audit?role='+me.role);const d=await r.json();setAudit(Array.isArray(d)?d:[]);}catch(e){}};
const loadDocs=async()=>{try{const r=await fetch(API+'/documents/expiring/list?days=60');const d=await r.json();setDocs(Array.isArray(d)?d:[]);}catch(e){}};
const loadVehicles=async()=>{try{const r=await fetch(API+'/fleet');const d=await r.json();setVehicles(Array.isArray(d)?d:(d.vehicles||d.data||[]));}catch(e){}};
const loadDue=async()=>{try{const r=await fetch(API+'/maintenance/due');const d=await r.json();setDue(Array.isArray(d)?d:[]);}catch(e){}};
useEffect(()=>{loadAudit();loadDocs();loadVehicles();loadDue();},[]);
const clearAudit=async()=>{if(!window.confirm('Clear all audit logs?'))return;
await fetch(API+'/audit/clear?role='+me.role,{method:'DELETE'});loadAudit();};
const saveDoc=async(id)=>{const e=docEdit[id]||{};if(!Object.keys(e).length)return;
await fetch(API+'/documents/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(e)});
setDocEdit(s=>{const n={...s};delete n[id];return n;});loadDocs();};
const addFuel=async()=>{if(!form.vehicle||!form.liters)return ok('Vehicle and liters required');
await fetch(API+'/maintenance/fuel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,liters:Number(form.liters),cost:Number(form.cost)||0,odometer:Number(form.odometer)||0})});
const v=form.vehicle;setForm({vehicle:'',liters:'',cost:'',odometer:'',note:''});loadFuelHist(v);};
const loadFuelHist=async(vid)=>{if(!vid)return;try{const r=await fetch(API+'/maintenance/fuel/'+vid);const d=await r.json();setFuelHist(Array.isArray(d)?d:[]);}catch(e){}};
const saveService=async()=>{if(!svc.vehicle||!svc.nextServiceDue)return;
const body={nextServiceDue:svc.nextServiceDue};if(svc.odometer)body.odometer=Number(svc.odometer);
await fetch(API+'/maintenance/service/'+svc.vehicle,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
setSvc({vehicle:'',nextServiceDue:'',odometer:''});loadDue();};
const pdfAudit=()=>exportPDF('Audit Log',['Time','Actor','Role','Action','Details'],audit.map(a=>[new Date(a.createdAt).toLocaleString(),a.actor||'',a.role||'',a.action||'',(a.details||'').slice(0,60)]),'audit-log.pdf');
const pdfDocs=()=>exportPDF('Document Expiry',['Vehicle','Document','Expiry','Status'],docs.flatMap(v=>v.expiring.map(e=>[v.vehicleNo,e.name,new Date(e.expiry).toLocaleDateString(),e.overdue?'OVERDUE':'Expiring'])),'doc-expiry.pdf');
const vname=v=>v.vehicleNo||v.regNo||v.number||v.vehicleNumber||String(v._id).slice(-6);
const tabs=[['docs','Documents'],['fuel','Fuel Log'],['maint','Maintenance'],['audit','Audit Log']];
return(<div style={{minHeight:'100vh',background:'#0a1128',color:'#e2e8f0',padding:16,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
<div><h1 style={{margin:0}}>System Center</h1><div style={{color:'#94a3b8',fontSize:12}}>Audit, Documents, Fuel, Maintenance</div></div>
<div style={{display:'flex',gap:8,alignItems:'center'}}><NotifBell/>
<button onClick={()=>window.location.href='/dashboard/Admin'} style={{...btn,background:'#1e293b',color:'#fff'}}>Back</button></div></div>
<div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
{tabs.map(t=>(<button key={t[0]} onClick={()=>setTab(t[0])} style={{...btn,background:tab===t[0]?'#38bdf8':'#1e293b',color:tab===t[0]?'#082f49':'#fff'}}>{t[1]}</button>))}
</div>
{tab==='audit'&&(<div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<h3>Audit Log ({audit.length})</h3>
<div><button onClick={pdfAudit} style={btn}>Export PDF</button>
<button onClick={clearAudit} style={{...btn,background:'#ef4444',color:'#fff'}}>Clear</button></div></div>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Time','Actor','Role','Action','Details'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
<tbody>{audit.map(a=><tr key={a._id}><td style={td}>{new Date(a.createdAt).toLocaleString()}</td><td style={td}>{a.actor}</td><td style={td}>{a.role}</td><td style={td}>{a.action}</td><td style={td}>{(a.details||'').slice(0,80)}</td></tr>)}</tbody></table></div></div>)}
{tab==='docs'&&(<div>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<h3>Document Expiry (60 days)</h3><button onClick={pdfDocs} style={btn}>Export PDF</button></div>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Vehicle','Document','Expiry','Status','Update expiry'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
<tbody>{docs.flatMap(v=>v.expiring.map((e,i)=>(<tr key={v._id+i}>
<td style={td}>{v.vehicleNo}</td><td style={td}>{e.name}</td>
<td style={td}>{new Date(e.expiry).toLocaleDateString()}</td>
<td style={td}><span style={{color:e.overdue?'#ef4444':'#fbbf24',fontWeight:700}}>{e.overdue?'OVERDUE':'Expiring'}</span></td>
<td style={td}><input type="date" style={inp} onChange={ev=>setDocEdit(s=>({...s,[v._id]:{...s[v._id],[e.name.toLowerCase()+'Expiry']:ev.target.value}}))}/>
<button onClick={()=>saveDoc(v._id)} style={{...btn,padding:'6px 10px'}}>Save</button></td></tr>)))}</tbody></table></div>
{docs.length===0&&<p style={{color:'#94a3b8'}}>No documents expiring in 60 days.</p>}</div>)}
{tab==='fuel'&&(<div><h3>Add Fuel Log</h3>
<div style={{display:'flex',flexWrap:'wrap',alignItems:'center'}}>
<select value={form.vehicle} onChange={e=>{setForm({...form,vehicle:e.target.value});loadFuelHist(e.target.value);}} style={{...inp,minWidth:160}}>
<option value="">Select vehicle</option>{vehicles.map(v=><option key={v._id} value={v._id}>{vname(v)}</option>)}</select>
<input placeholder="Liters" type="number" value={form.liters} onChange={e=>setForm({...form,liters:e.target.value})} style={{...inp,width:90}}/>
<input placeholder="Cost" type="number" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} style={{...inp,width:90}}/>
<input placeholder="Odometer" type="number" value={form.odometer} onChange={e=>setForm({...form,odometer:e.target.value})} style={{...inp,width:110}}/>
<input placeholder="Note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{...inp,width:140}}/>
<button onClick={addFuel} style={btn}>Add</button></div>
<h3>History ({fuelHist.length})</h3>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Date','Liters','Cost','Odometer','Note'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
<tbody>{fuelHist.map(f=><tr key={f._id}><td style={td}>{new Date(f.date).toLocaleDateString()}</td><td style={td}>{f.liters}</td><td style={td}>{f.cost}</td><td style={td}>{f.odometer}</td><td style={td}>{f.note}</td></tr>)}</tbody></table></div></div>)}
{tab==='maint'&&(<div><h3>Service Due (7 days / overdue)</h3>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Vehicle','Odometer','Next Service Due','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
<tbody>{due.map(v=>(<tr key={v._id}><td style={td}>{vname(v)}</td><td style={td}>{v.odometer||'-'}</td>
<td style={td}>{v.nextServiceDue?new Date(v.nextServiceDue).toLocaleDateString():'Not set'}</td>
<td style={td}>{v.nextServiceDue&&new Date(v.nextServiceDue)<new Date()?<span style={{color:'#ef4444',fontWeight:700}}>OVERDUE</span>:<span style={{color:'#fbbf24'}}>Due soon</span>}</td></tr>))}</tbody></table></div>
<h3>Update Service Schedule</h3>
<div style={{display:'flex',flexWrap:'wrap',alignItems:'center'}}>
<select value={svc.vehicle} onChange={e=>setSvc({...svc,vehicle:e.target.value})} style={{...inp,minWidth:160}}>
<option value="">Select vehicle</option>{vehicles.map(v=><option key={v._id} value={v._id}>{vname(v)}</option>)}</select>
<input type="date" value={svc.nextServiceDue} onChange={e=>setSvc({...svc,nextServiceDue:e.target.value})} style={inp}/>
<input placeholder="Odometer" type="number" value={svc.odometer} onChange={e=>setSvc({...svc,odometer:e.target.value})} style={{...inp,width:110}}/>
<button onClick={saveService} style={btn}>Save</button></div></div>)}
</div>);}
