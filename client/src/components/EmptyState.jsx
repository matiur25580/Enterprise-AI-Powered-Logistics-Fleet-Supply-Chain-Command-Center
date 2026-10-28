export default function EmptyState({icon,title,sub}){
  return <div style={{textAlign:'center',padding:'30px 12px',color:'#6b7280'}}>
    <div style={{fontSize:36}}>{icon||'\u{1F4E6}'}</div>
    <div style={{fontWeight:700,marginTop:8,color:'#374151'}}>{title||'Nothing here yet'}</div>
    {sub&&<div style={{fontSize:13,marginTop:4}}>{sub}</div>}
  </div>;
}
