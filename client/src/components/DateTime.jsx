import {useEffect,useState} from 'react';
export default function DateTime({dark}){
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  const p=n=>String(n).padStart(2,'0');
  const date=p(now.getDate())+'.'+p(now.getMonth()+1)+'.'+now.getFullYear();
  let h=now.getHours(); const ap=h>=12?'PM':'AM'; h=h%12||12;
  const time=p(h)+'.'+p(now.getMinutes())+'.'+p(now.getSeconds())+' '+ap;
  return <div style={{textAlign:'right',lineHeight:1.35,marginRight:4}}>
    <div style={{fontWeight:700,fontSize:14}}>{date}</div>
    <div style={{fontSize:12,color:dark?'#93a7c9':'#5b6b87'}}>{time}</div>
  </div>;
}
