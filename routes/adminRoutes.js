// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { upload } = require('../middleware/fileUpload'); // You'll need to set up file upload middleware

// Add CSRF protection middleware if needed

router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', upload.array('images', 4), adminController.postAddProduct);
router.get('/products', adminController.getProducts);
router.get('/edit-product/:id', adminController.getEditProduct);
router.post('/edit-product/:id', upload.array('images', 4), adminController.postEditProduct);
router.delete('/product/:id', adminController.deleteProduct);

module.exports = router;