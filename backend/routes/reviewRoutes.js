const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, reviewController.createReview);
router.get('/:targetId', reviewController.getReviewsByTarget);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
