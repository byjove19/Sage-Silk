const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const { ensureAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Admin Root - Redirect to Dashboard
router.get('/', ensureAdmin, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin Dashboard
router.get('/dashboard', ensureAdmin, (req, res) => {
  res.render('admin/dashboard', { 
    user: req.user,
    title: 'Admin Dashboard'
  });
});

// Admin Profile
router.get('/profile', ensureAdmin, (req, res) => {
  res.render('admin/profile', {
    user: req.user,
    title: 'Admin Profile'
  });
}); 
// Add Product Form
router.get('/products/add', ensureAdmin, (req, res) => {
  const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Wigs', 'Makeup'];
  res.render('admin/add-product', { 
    categories,
    user: req.user 
  });
});

// Process Add Product
router.post('/products', ensureAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, category, subcategory, stock, featured } = req.body;
    
    const images = req.files.map(file => file.path.replace('public', ''));
    
    const newProduct = new Product({
      name,
      price,
      description,
      category,
      subcategory,
      images,
      stock,
      featured: featured === 'on'
    });

    await newProduct.save();
    req.flash('success', 'Product added successfully');
    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error adding product:', err);
    req.flash('error', 'Failed to add product');
    res.redirect('/admin/products/add');
  }
});

// List All Products
router.get('/products', ensureAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('admin/products', { 
      products,
      user: req.user 
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    req.flash('error', 'Failed to fetch products');
    res.redirect('/admin/dashboard');
  }
});

// Edit Product Form
router.get('/products/:id/edit', ensureAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Wigs', 'Makeup'];
    
    res.render('admin/edit-product', { 
      product,
      categories,
      user: req.user 
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    req.flash('error', 'Product not found');
    res.redirect('/admin/products');
  }
});

// Update Product
router.put('/products/:id', ensureAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, category, subcategory, stock, featured } = req.body;
    
    const updateData = {
      name,
      price,
      description,
      category,
      subcategory,
      stock,
      featured: featured === 'on'
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path.replace('public', ''));
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error updating product:', err);
    req.flash('error', 'Failed to update product');
    res.redirect(`/admin/products/${req.params.id}/edit`);
  }
});

// Delete Product
router.delete('/products/:id', ensureAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error deleting product:', err);
    req.flash('error', 'Failed to delete product');
    res.redirect('/admin/products');
  }
});

module.exports = router;