import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';import {ThemeProvider} from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Success from './pages/Success';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Admin from './pages/dashboards/Admin';import FleetManager from './pages/dashboards/FleetManager';
import WarehouseManager from './pages/dashboards/WarehouseManager';import Driver from './pages/dashboards/Driver';import Client from './pages/dashboards/Client';
export default function App(){
  return <ThemeProvider><AuthProvider><BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/dashboard/Admin" element={<ProtectedRoute role="Admin"><Admin/></ProtectedRoute>}/>
      <Route path="/dashboard/FleetManager" element={<ProtectedRoute role="FleetManager"><FleetManager/></ProtectedRoute>}/>
      <Route path="/dashboard/WarehouseManager" element={<ProtectedRoute role="WarehouseManager"><WarehouseManager/></ProtectedRoute>}/>
      <Route path="/dashboard/Driver" element={<ProtectedRoute role="Driver"><Driver/></ProtectedRoute>}/>
      <Route path="/dashboard/Client" element={<ProtectedRoute role="Client"><Client/></ProtectedRoute>}/>
      <Route path="/success" element={<Success/>}/>
    </Routes>
  </BrowserRouter></AuthProvider></ThemeProvider>;
}
