import {useEffect,useState} from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
export default function ForecastChart({card,bd,sub}){
  const [d,setD]=useState(null);
  const [err,setErr]=useState('');
  useEffect(()=>{
    fetch(API_BASE.replace(/\/$/,'')+'/forecast/demand?days=14')
      .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
      .then(setD).catch(e=>setErr(e.message));
  },[]);
  if(err) return (<div style={{background:card,border:bd,borderRadius:12,padding:16,marginBottom:14}}>
    <h3 style={{marginTop:0}}>🔮 Demand Forecast</h3>
    <p style={{color:'#ef4444',fontSize:13}}>Forecast unavailable right now.</p></div>);
  if(!d) return (<div style={{background:card,border:bd,borderRadius:12,padding:16,marginBottom:14}}>
    <h3 style={{marginTop:0}}>🔮 Demand Forecast</h3>
    <div style={{display:'flex',alignItems:'flex-end',gap:4,height:140,paddingTop:10}}>
      {[70,95,60,110,85,120,100].map((h,i)=><Skeleton key={i} style={{flex:1,height:h}}/>)}
    </div></div>);
  const maxF=Math.max(1,...d.forecast);
  const allZero=d.forecast.every(v=>v===0);
  const pastAvg=d.counts.reduce((a,b)=>a+b,0)/Math.max(1,d.counts.length);
  const futAvg=d.forecast.reduce((a,b)=>a+b,0)/7;
  const trend=futAvg>pastAvg*1.1?'📈 rising':(futAvg<pastAvg*0.9?'📉 falling':'➡️ stable');
  return (<div style={{background:card,border:bd,borderRadius:12,padding:16,marginBottom:14}}>
    <h3 style={{marginTop:0}}>🔮 AI Demand Forecast <span style={{fontSize:11,background:'linear-gradient(90deg,#8b5cf6,#6d28d9)',color:'#fff',padding:'2px 8px',borderRadius:20,verticalAlign:'middle'}}>NEXT 7 DAYS</span> <span style={{fontSize:12,color:sub,fontWeight:400}}>{trend}</span></h3>
    {allZero
      ? <EmptyState icon="🔮" title="Not enough history yet" sub="Make a few bookings and the AI forecast will appear here."/>
      : <div>
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:140,paddingTop:10}}>
            {d.forecast.map((n,i)=>(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
              <div style={{fontSize:10,color:sub}}>{n>0?n:''}</div>
              <div title={d.future[i]+': ~'+n+' bookings (predicted)'} style={{width:'100%',maxWidth:28,height:Math.max(4,Math.round(n/maxF*100))+'%',background:'linear-gradient(180deg,#a78bfa,#7c3aed)',borderRadius:'4px 4px 0 0',borderTop:'2px dashed #c4b5fd'}}/>
              <div style={{fontSize:9,color:sub,marginTop:4}}>{d.future[i].slice(5).replace('-','/')}</div>
            </div>))}
          </div>
          <p style={{color:sub,fontSize:11,margin:'10px 0 0'}}>Predicted with exponential smoothing + linear trend on the last 14 days of bookings.</p>
        </div>}
  </div>);
}
