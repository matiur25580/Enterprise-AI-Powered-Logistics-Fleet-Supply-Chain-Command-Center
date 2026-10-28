import {useEffect,useState} from 'react';import io from 'socket.io-client';import {useAuth} from '../../context/AuthContext';import {useTheme} from '../../context/ThemeContext';
const socket=io('http://localhost:5000');
export default function Driver(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();const [loc,setLoc]=useState({lat:22.5726,lng:88.3639});
  useEffect(()=>{const t=setInterval(()=>{const n={lat:loc.lat+0.001,lng:loc.lng+0.001,driver:'Driver-1'};setLoc(n);socket.emit('update-location',n);},3000);return()=>clearInterval(t);},[loc]);
  return <div style={{padding:20}}><button onClick={toggle}>{dark?'☀️':'🌙'}</button><button onClick={logout} style={{float:'right'}}>Logout</button><h1>Driver Dashboard</h1><p style={{color:'#22c55e'}}>Live location sharing ON</p><p>Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}</p></div>;
}
