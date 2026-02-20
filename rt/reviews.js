const express = require("express");
const router = express.Router();
const reviewController = require("../ctrl/ctrller");
const { authcheck } = require("../auth/check");
router.post("/", authcheck, reviewController.createReview);
router.delete("/:id", authcheck, reviewController.deleteReview);
router.patch("/:id/moderate", authcheck, reviewController.reviewModeration);
router.get("/product/:productId", reviewController.getProductReviews);
module.exports = router;
