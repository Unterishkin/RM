const { verifyToken } = require("./jwt");
function authcheck(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Требуется токен авторизации",
    });
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Неверный токен",
    });
  }
  req.userId = decoded.userId;
  next();
}
module.exports = { authcheck };
