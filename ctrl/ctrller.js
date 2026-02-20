const Review = require("../mdl/review.js");
const mongoose = require("mongoose");

exports.createReview = async (req, res) => {
  try {
    const { ProductID, rating, comment, images, isAnonymous } = req.body;
    const userID = req.userId;

    if (!userID || !ProductID || !rating) {
      return res.status(400).json({
        success: false,
        message: "ID пользователя, ID продукции и рейтинг обязательны",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Рейтинг должен быть от 1 до 5",
      });
    }
    if (typeof isAnonymous !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Значение должно быть true или false",
      });
    }
    const existReview = await Review.findOne({
      userID,
      ProductID,
      status: { $ne: "Отклонён" },
    });
    if (existReview) {
      return res.status(400).json({
        success: false,
        message: "Вы уже оставили отзыв",
      });
    }
    const review = await Review.create({
      userID,
      ProductID,
      rating,
      comment,
      images,
      status: "На рассмотрении",
      isAnonymous: isAnonymous,
    });
    res.status(200).json({
      success: true,
      message: "Отзыв успешно отправлен на рассмотерение модерации",
      review,
    });
  } catch (error) {
    console.error("Ошибка при создании отзыва:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Вы уже оставили отзыв на товар",
      });
    }
    res.status(500).json({
      success: false,
      message: "Ошибка создания отзыва",
      error: error.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Отзыв не найден",
      });
    }
    res.json({
      success: true,
      message: "Отзыв успешно удалён",
      review,
    });
  } catch (error) {
    console.error("Ошибка при удалении отзыва:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при удалении отзыва",
      error: error.message,
    });
  }
};

exports.reviewModeration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Одобрен", "Отклонён"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Статус отзыва должен быть "одобрен" или "отклонён"',
      });
    }
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );
    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Отзыв не найден",
      });
    }
    res.json({
      success: true,
      message: `Отзыв успешно ${status.toLowerCase()}`,
      review,
    });
  } catch (error) {
    console.error("Ошибка при модерации отзыва:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при модерации",
      error: error.message,
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Неверный формат ID продукта",
      });
    }

    const reviews = await Review.find({ ProductID: productId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении отзывов",
      error: error.message,
    });
  }
};
