const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/check-availability', controller.checkAvailability);
router.post('/', verifyToken, controller.createBooking);
router.post('/checkin', verifyToken, controller.checkIn);
router.put('/:bookingId/checkout', verifyToken, controller.checkOut);

module.exports = router;