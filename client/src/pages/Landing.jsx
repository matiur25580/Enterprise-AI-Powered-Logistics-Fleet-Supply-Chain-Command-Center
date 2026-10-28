import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {useTheme} from '../context/ThemeContext';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Landing(){
  const {dark,toggle}=useTheme();
  const [stats,setStats]=useState({v:0,t:0,w:0,b:0});
  useEffect(()=>{(async()=>{
    const g=async u=>{try{const r=await axios.get(API+u);return (r.data||[]).length;}catch(e){return 0;}};
    setStats({v:await g('/fleet/all'),t:await g('/trip/all'),w:await g('/warehouse/all'),b:await g('/booking/all')});
  })();},[]);
  const bg=dark?'#0a1128':'#eef2f9', card=dark?'#101d38':'#ffffff';
  const text=dark?'#eef3fb':'#0f1e38', sub=dark?'#93a7c9':'#5b6b87';
  const bd=dark?'1px solid #27406e':'1px solid #dbe4f0';
  const grad='linear-gradient(90deg,#f59e0b,#f97316)';
  const btn={padding:'12px 28px',borderRadius:10,border:'none',background:grad,color:'#231303',fontWeight:800,cursor:'pointer',fontSize:15,textDecoration:'none',display:'inline-block'};
  const btnO={padding:'12px 28px',borderRadius:10,border:bd,background:card,color:text,fontWeight:700,cursor:'pointer',fontSize:15,textDecoration:'none',display:'inline-block'};
  const feats=[
    ['Live GPS Tracking','Real-time vehicle locations stream to the command center via WebSockets.'],
    ['Smart Trip Management','Convert client bookings to trips in one click, assign vehicles and drivers.'],
    ['Warehouse Intelligence','Capacity utilization bars, stock in/out control and fullness alerts.'],
    ['Instant E-Invoicing','Auto-generated PDF invoices with unique numbers for every booking.'],
    ['Email Notifications','Booking confirmations and delivery alerts powered by Mailjet.'],
    ['AI Insights','Fleet utilization, idle vehicle and near-full warehouse detection.'],
    ['Role-Based Access','Admin, Fleet Manager, Warehouse Manager, Driver and Client portals.'],
    ['Secure OTP Auth','Email OTP verification with role-scoped accounts and protected routes.'],
  ];
  const roles=[
    ['Admin','Full command center: fleet, trips, warehouses, bookings, reports and AI insights.'],
    ['Fleet Manager','Vehicles, driver assignment, trip creation and booking-to-trip conversion.'],
    ['Warehouse Manager','Warehouse network, capacity tracking and stock management.'],
    ['Driver','Assigned trips, live location sharing and one-tap delivery confirmation.'],
    ['Client','Book shipments, track status live and download PDF invoices.'],
    ['Accountant','Freight billing, payment collection tracking and revenue analytics.'],
  ];
  const steps=[
    ['1','Client books','Shipment booked in seconds with instant email confirmation and invoice.'],
    ['2','Manager dispatches','Booking converted to a trip with vehicle and driver assigned.'],
    ['3','Driver delivers','Live GPS tracking with one-tap status updates on the road.'],
    ['4','Auto notified','Client gets delivery email; invoice ready for download.'],
  ];
  return (
  <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:bd,position:'sticky',top:0,background:bg,zIndex:10}}>
      <div style={{fontSize:20,fontWeight:800}}>Fleet<span style={{color:'#f59e0b'}}>Command</span></div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button onClick={toggle} style={{...btnO,padding:'8px 14px',fontSize:13}}>{dark?'Light':'Dark'}</button>
        <Link to="/login" style={{...btnO,padding:'8px 18px',fontSize:13}}>Login</Link>
        <Link to="/register" style={{...btn,padding:'8px 18px',fontSize:13}}>Get Started</Link>
      </div>
    </nav>
    <header style={{textAlign:'center',padding:'70px 20px 50px',maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'inline-block',background:dark?'#1a2b4d':'#fff7e6',border:bd,borderRadius:20,padding:'6px 16px',fontSize:13,color:'#f59e0b',fontWeight:700,marginBottom:18}}>ENTERPRISE LOGISTICS PLATFORM</div>
      <h1 style={{fontSize:'clamp(30px,5vw,52px)',margin:'0 0 16px',lineHeight:1.15}}>AI-Powered Logistics Fleet<br/>Supply Chain <span style={{background:grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Command Center</span></h1>
      <p style={{color:sub,fontSize:17,maxWidth:640,margin:'0 auto 28px'}}>One platform for your entire supply chain — bookings, fleet, warehouses, drivers and clients, connected in real time.</p>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <Link to="/register" style={btn}>Start Shipping</Link>
        <Link to="/login" style={btnO}>Login to Dashboard</Link>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:12,marginTop:44,maxWidth:640,marginLeft:'auto',marginRight:'auto'}}>
        {[['Vehicles',stats.v],['Trips',stats.t],['Warehouses',stats.w],['Bookings',stats.b]].map(s=>(
          <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:16}}>
            <div style={{fontSize:26,fontWeight:800,color:'#f59e0b'}}>{s[1]}</div>
            <div style={{fontSize:12,color:sub}}>{s[0]}</div>
          </div>))}
      </div>
    </header>
    <section style={{maxWidth:1080,margin:'0 auto',padding:'20px 20px 50px'}}>
      <h2 style={{textAlign:'center',fontSize:28,marginBottom:8}}>Everything you need to run logistics</h2>
      <p style={{textAlign:'center',color:sub,marginBottom:28}}>Built for scale, designed for operators.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:14}}>
        {feats.map(f=>(
          <div key={f[0]} style={{background:card,border:bd,borderRadius:12,padding:18}}>
            <div style={{fontWeight:700,marginBottom:8}}>{f[0]}</div>
            <div style={{fontSize:14,color:sub}}>{f[1]}</div>
          </div>))}
      </div>
    </section>
    <section style={{maxWidth:1080,margin:'0 auto',padding:'0 20px 50px'}}>
      <h2 style={{textAlign:'center',fontSize:28,marginBottom:28}}>Six portals, one command center</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
        {roles.map(r=>(
          <div key={r[0]} style={{background:grad,borderRadius:12,padding:2}}>
            <div style={{background:card,borderRadius:10,padding:16,height:'100%',boxSizing:'border-box'}}>
              <div style={{fontWeight:800,marginBottom:8,color:'#f59e0b'}}>{r[0]}</div>
              <div style={{fontSize:13,color:sub}}>{r[1]}</div>
            </div>
          </div>))}
      </div>
    </section>
    <section style={{maxWidth:900,margin:'0 auto',padding:'0 20px 60px'}}>
      <h2 style={{textAlign:'center',fontSize:28,marginBottom:28}}>How it works</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>
        {steps.map(s=>(
          <div key={s[0]} style={{background:card,border:bd,borderRadius:12,padding:18,textAlign:'center'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:grad,color:'#231303',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:18}}>{s[0]}</div>
            <div style={{fontWeight:700,marginBottom:6}}>{s[1]}</div>
            <div style={{fontSize:13,color:sub}}>{s[2]}</div>
          </div>))}
      </div>
      <div style={{textAlign:'center',marginTop:36}}>
        <Link to="/register" style={btn}>Create your account</Link>
      </div>
    </section>
    <footer style={{borderTop:bd,padding:'20px',textAlign:'center',color:sub,fontSize:13}}>
      FleetCommand — Enterprise AI-Powered Logistics Fleet Supply Chain Command Center
    </footer>
  </div>);
}
