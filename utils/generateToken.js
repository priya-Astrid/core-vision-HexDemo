const jwt = require("jsonwebtoken");
 const  generateToken = (user) =>{
    return jwt.sign(
    {
      id: user._id,
      orgId: user.organization?._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    },
  );
}
module.exports = {generateToken};
