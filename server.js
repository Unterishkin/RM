require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const reviewRoutes = require("./rt/reviews");
const authRoutes = require("./rt/auth");
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`запущен на порту ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl)
  .then(() => console.log("+"))
  .catch(err => console.error("-", err.message));
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Успешное подключение");
  })
  .catch((err) => {
    console.error("Ошибка подключения");
  });
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use((err, req, res) => {
  console.error("Ошибка", err);
  res.status(err.status(500)).json({
    success: false,
    message: (err.message = "Внутреняя ошбика"),
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
app.listen(PORT, () => {
  console.log(`http:localhost:${PORT}`);
});
