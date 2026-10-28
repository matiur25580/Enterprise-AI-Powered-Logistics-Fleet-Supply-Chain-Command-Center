const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{ user:process.env.EMAIL_USER?.trim(), pass:process.env.EMAIL_PASS?.replace(/\s+/g,'') }
});
module.exports = async (to,otp)=>{
  await transporter.sendMail({
    from:process.env.EMAIL_USER, to,
    subject:'Logistics OTP Verification',
    text:`Your OTP is ${otp}. Valid for 5 minutes.`
  });
};
