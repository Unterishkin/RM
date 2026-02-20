const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Пользователь",
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Товар",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        type: String,
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["На рассмотрении", "Одобрен", "Отклонён"],
      default: "На рассмотрении",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ ProductID: 1, createdAt: -1 });
reviewSchema.index({ userID: 1, ProductID: 1 }, { unique: true });

reviewSchema.statics.calculateAvgRate = async function (ProductID) {
  const stats = await this.aggregate([
    { $match: { ProductID: ProductID, status: "Одобрен" } },
    {
      $group: {
        _id: "$ProductID",
        avgRate: { $avg: "$rating" },
        rewiewCount: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(ProductId, {
      avgRate: stats[0].avgRate,
      rewiewCount: [0].rewiewCount,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(ProductID, {
      avgRate: 0,
      rewiewCount: 0,
    });
  }
};
module.exports = mongoose.model("Review", reviewSchema);
