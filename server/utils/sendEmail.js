module.exports=async(to,otp)=>{
  const key=(process.env.MAILJET_API_KEY||'').trim();
  const secret=(process.env.MAILJET_SECRET||'').trim();
  if(!key||!secret) throw new Error('Email service not configured');
  const sender=(process.env.EMAIL_USER||'').trim();
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
        Subject:'FleetCommand - Your OTP Code',
        TextPart:'Your FleetCommand OTP is '+otp+'. Valid for 5 minutes.',
        HTMLPart:'<div style="font-family:sans-serif;padding:20px"><h2>FleetCommand</h2><p>Your verification code is:</p><h1 style="letter-spacing:6px">'+otp+'</h1><p>Valid for 5 minutes. Do not share this code.</p></div>',
      }]}),
    });
    if(!res.ok){const t=await res.text();throw new Error('Email API '+res.status+': '+t.slice(0,150));}
  }finally{clearTimeout(timer);}
};
