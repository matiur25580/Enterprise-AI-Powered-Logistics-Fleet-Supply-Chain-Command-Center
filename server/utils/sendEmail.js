module.exports=async(to,otp)=>{
  const key=(process.env.BREVO_API_KEY||'').trim();
  if(!key) throw new Error('Email service not configured');
  const sender=(process.env.EMAIL_USER||'').trim();
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),20000);
  try{
    const res=await fetch('https://api.brevo.com/v3/smtp/email',{
      method:'POST',
      headers:{'api-key':key,'Content-Type':'application/json','accept':'application/json'},
      signal:ctrl.signal,
      body:JSON.stringify({
        sender:{name:'FleetCommand',email:sender},
        to:[{email:to}],
        subject:'FleetCommand - Your OTP Code',
        htmlContent:'<div style="font-family:sans-serif;padding:20px"><h2>FleetCommand</h2><p>Your verification code is:</p><h1 style="letter-spacing:6px">'+otp+'</h1><p>Valid for 5 minutes. Do not share this code.</p></div>',
        textContent:'Your FleetCommand OTP is '+otp+'. Valid for 5 minutes.',
      }),
    });
    if(!res.ok){const t=await res.text();throw new Error('Email API '+res.status+': '+t.slice(0,150));}
  }finally{clearTimeout(timer);}
};
