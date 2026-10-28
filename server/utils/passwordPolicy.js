function isStrongPassword(pw){
  return typeof pw === 'string' && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}
module.exports = { isStrongPassword };
