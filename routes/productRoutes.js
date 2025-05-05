const express = require('express');
const Product = require('../models/products');
const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('product', { products }); // Assuming you're listing products
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET product details by ID
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('not-found');
    }

    res.render('product-accordion', { product }); // Single product view
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send('Server error');
  }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.render('category-products', { products }); // Create this view for category listings
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET products by category and subcategory
router.get('/products/:category/:subcategory', async (req, res) => {
  const { category, subcategory } = req.params;
  try {
    const products = await Product.find({ category, subcategory });
    res.render('subcategory-products', { products }); // Customize this view as needed
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/product-accordion', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('product-accordion', { products }); // Pass an array
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// POST a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, oldPrice, sku, image, description, category, subcategory } = req.body;

    if (!category || !subcategory) {
      return res.status(400).json({ message: "Category and subcategory are required." });
    }

    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price.replace(/[#,]/g, '')),
      oldPrice: parseFloat(oldPrice.replace(/[#,]/g, '')),
      sku,
      category,
      subcategory,
      images: [image, image, image, image],
      stock: 10,
      brand: 'Unknown',
      size: [],
      color: [],
      ratings: { average: 0, reviews: [] }
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
