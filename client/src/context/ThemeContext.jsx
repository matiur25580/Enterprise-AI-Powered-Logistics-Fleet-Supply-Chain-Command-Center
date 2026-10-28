import {createContext,useState,useContext,useEffect} from 'react';
const C=createContext();
export const ThemeProvider=({children})=>{
  const [dark,setDark]=useState(true);
  useEffect(()=>{document.body.style.background=dark?'#0f172a':'#f8fafc';document.body.style.color=dark?'#fff':'#0f172a';},[dark]);
  return <C.Provider value={{dark,toggle:()=>setDark(!dark)}}>{children}</C.Provider>;
};
export const useTheme=()=>useContext(C);
