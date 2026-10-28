import {useAuth} from '../../context/AuthContext';import {useTheme} from '../../context/ThemeContext';
export default function Client(){
  const {logout}=useAuth();const {dark,toggle}=useTheme();
  const now=new Date();
  return <div style={{padding:20}}>
    <button onClick={toggle}>{dark?'☀️':'🌙'}</button>
    <button onClick={logout} style={{float:'right'}}>Logout</button>
    <h1>Client Dashboard</h1>
    <p>{now.toLocaleDateString('en-GB').replaceAll('/','.')+' '+now.toLocaleTimeString('en-US')}</p>
    <p style={{color:'#22c55e'}}>Welcome to Logistics Command Center</p>
  </div>;
}
