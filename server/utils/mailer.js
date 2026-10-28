module.exports.sendMail=async(to,subject,html)=>{
  const key=(process.env.MAILJET_API_KEY||'').trim();
  const secret=(process.env.MAILJET_SECRET||'').trim();
  const sender=(process.env.EMAIL_USER||'').trim();
  if(!key||!secret||!sender){console.log('mailer: Mailjet env missing, skipping');return;}
  const auth=Buffer.from(key+':'+secret).toString('base64');
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),20000);
  try{
    const res=await fetch('https://api.mailjet.com/v3.1/send',{
      method:'POST',
      headers:{'Authorization':'Basic '+auth,'Content-Type':'application/json'},
      signal:ctrl.signal,
      body:JSON.stringify({Messages:[{
        From:{Email:sender,Name:'FleetCommand'},
        To:[{Email:to}],
        Subject:subject,
        TextPart:subject,
        HTMLPart:html,
      }]}),
    });
    if(!res.ok){const t=await res.text();throw new Error('Email API '+res.status+': '+t.slice(0,150));}
    console.log('mailer: sent to',to);
  }finally{clearTimeout(timer);}
};
