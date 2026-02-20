const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "test-key";

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "90d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
module.exports = { generateToken, verifyToken };
