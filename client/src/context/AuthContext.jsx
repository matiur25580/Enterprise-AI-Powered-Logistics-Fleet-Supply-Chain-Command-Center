import {createContext,useState,useContext} from 'react';
import axios from 'axios';
const C=createContext();
// Restore the previous browser session once so the app can initialize its signed-in state.
function readStoredUser(){
  try{return JSON.parse(localStorage.getItem('user')||'null');}catch(e){return null;}
}
const initialUser=readStoredUser();
if(initialUser&&initialUser.token)axios.defaults.headers.common.Authorization='Bearer '+initialUser.token;
export const AuthProvider=({children})=>{
  const [user,setUser]=useState(initialUser);
  const login=(d)=>{
    localStorage.setItem('user',JSON.stringify(d));
    if(d&&d.token)axios.defaults.headers.common.Authorization='Bearer '+d.token;
    setUser(d);
  };
  const logout=()=>{
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    window.location.href='/login';
  };
  return <C.Provider value={{user,login,logout}}>{children}</C.Provider>;
};
export const useAuth=()=>useContext(C);
