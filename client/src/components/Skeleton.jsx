export default function Skeleton({h,w,style}){
  return <div style={{height:h||16,width:w||'100%',borderRadius:8,
    background:'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)',
    backgroundSize:'200% 100%',animation:'skshim 1.2s infinite linear',...style}}>
    <style>{'@keyframes skshim{to{background-position:-200% 0}}'}</style>
  </div>;
}
