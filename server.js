const express = require('express');
const mongoose = require('mongoose');
const reviewRoutes = require('./rt/reviews');
const authRoutes = require('./rt/auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Reviews API' });
});
const mongoUrl = process.env.MONGODB_URI;
if (!mongoUrl) {
  console.error('MONGODB_URI не задана');
  process.exit(1);
}
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Подключение успешно');
  })
  .catch(err => {
    console.error('Ошибка подключения:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
