import {createContext,useState,useContext} from 'react';
const C=createContext();
export const AuthProvider=({children})=>{
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user')||'null'));
  const login=(d)=>{localStorage.setItem('user',JSON.stringify(d));setUser(d);};
  const logout=()=>{localStorage.removeItem('user');setUser(null);window.location.href='/login';};
  return <C.Provider value={{user,login,logout}}>{children}</C.Provider>;
};
export const useAuth=()=>useContext(C);
