const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
  service:'gmail',
  auth:{user:(process.env.EMAIL_USER||'').trim(),pass:(process.env.EMAIL_PASS||'').replace(/\s+/g,'')},
  connectionTimeout:15000,
  greetingTimeout:15000,
  socketTimeout:20000,
});
module.exports=async(to,otp)=>{
  await transporter.sendMail({
    from:process.env.EMAIL_USER,
    to,
    subject:'FleetCommand - Your OTP Code',
    html:'<div style="font-family:sans-serif;padding:20px"><h2>🚚 FleetCommand</h2><p>Your verification code is:</p><h1 style="letter-spacing:6px">'+otp+'</h1><p>Valid for 5 minutes. Do not share this code.</p></div>',
    text:'Your FleetCommand OTP is '+otp+'. Valid for 5 minutes.',
  });
};
