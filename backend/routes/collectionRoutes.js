const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, collectionController.getMyCollections);
router.post('/', verifyToken, collectionController.createCollection);
router.get('/:id', verifyToken, collectionController.getCollectionDetail);
router.post('/:id/photos', verifyToken, collectionController.addPhoto);
router.delete('/:id', verifyToken, collectionController.deleteCollection);

module.exports = router;
