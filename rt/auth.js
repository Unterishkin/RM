const express = require("express");
const router = express.Router();
const { generateToken } = require("../auth/jwt");

function validatePassword(password) {
  if (password.length < 10) {
    return "Пароль должен содержать минимум 10 символов";
  }
  return null;
}
router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const User = require("../mdl/user");
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Email,пароль и отображаемое имя обязательны",
      });
    }
    const passwordErr = validatePassword(password);
    if (passwordErr) {
      return res.status(400).json({
        success: false,
        message: passwordErr,
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Пользователь с таким email уже существует",
      });
    }
    const newUser = await User.create({
      email,
      password,
      displayName,
    });
    const token = generateToken(newUser._id);
    return res.status(201).json({
      success: true,
      message: "Регистрация успешна",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
      },
    });
  } catch (error) {
    console.error("Ошибка регистрации", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при регистрации пользователя",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require("../mdl/user");
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email и пароль обязательны",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Неверный wmail или пароль",
      });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Вход выполнен",
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при входе",
      error: error.message,
    });
  }
});
module.exports = router;
