const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/', workshopController.getAllWorkshops);
router.get('/:id', workshopController.getWorkshopById);
// Chỉ role 'expert' mới được tạo workshop — đổi tên role bên dưới nếu nhóm đặt khác
router.post('/', verifyToken, checkRole('expert'), workshopController.createWorkshop);
router.post('/:id/register', verifyToken, workshopController.registerWorkshop);
router.delete('/:id/register', verifyToken, workshopController.cancelRegistration);

module.exports = router;
