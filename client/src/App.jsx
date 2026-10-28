import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';import {ThemeProvider} from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Success from './pages/Success';
import Admin from './pages/dashboards/Admin';import FleetManager from './pages/dashboards/FleetManager';
import WarehouseManager from './pages/dashboards/WarehouseManager';import Driver from './pages/dashboards/Driver';import Client from './pages/dashboards/Client';
export default function App(){
  return <ThemeProvider><AuthProvider><BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/dashboard/Admin" element={<Admin/>}/>
      <Route path="/dashboard/FleetManager" element={<FleetManager/>}/>
      <Route path="/dashboard/WarehouseManager" element={<WarehouseManager/>}/>
      <Route path="/dashboard/Driver" element={<Driver/>}/>
      <Route path="/dashboard/Client" element={<Client/>}/>
      <Route path="/success" element={<Success/>}/>
    </Routes>
  </BrowserRouter></AuthProvider></ThemeProvider>;
}
