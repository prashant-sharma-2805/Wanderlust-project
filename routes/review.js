const express = require("express");
const router = express.Router({mergeParams : true});
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");



//Reviews
//Post Review route
router.post("/", isLoggedIn ,validateReview, reviewController.createReview);


//Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor , reviewController.destroyReview);

module.exports = router;