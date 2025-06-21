const express = require('express');
const Product = require('../models/products');
const slugify = require('slugify');
const router = express.Router();

/**
 * GET all products
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('product', { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET product details by ID
 */
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render('not-found');
    }
    res.render('product-accordion', { product });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).send('Server error');
  }
});

/**
 * ✅ NEW: GET product details by slug
 */
router.get('/product/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).render('not-found');
    }
    res.render('product-accordion', { product });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res.status(500).send('Server error');
  }
});

/**
 * GET products by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.render('category-products', { products });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET products by category and subcategory
 */
router.get('/products/:category/:subcategory', async (req, res) => {
  const { category, subcategory } = req.params;
  try {
    const products = await Product.find({ category, subcategory });
    res.render('subcategory-products', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET all products for product accordion view
 */
router.get('/product-accordion', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('product-accordion', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * POST a new product (via Postman or backend form)
 */
router.post('/', async (req, res) => {
  try {
    let { name, price, oldPrice, sku, image, images, description, category, subcategory } = req.body;

    if (!category || !subcategory) {
      return res.status(400).json({ message: "Category and subcategory are required." });
    }

    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[#,]/g, ''));
    }
    if (typeof oldPrice === 'string') {
      oldPrice = parseFloat(oldPrice.replace(/[#,]/g, ''));
    }

    const slug = slugify(name, { lower: true, strict: true });

    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      oldPrice,
      sku,
      category,
      subcategory,
      images: images && images.length > 0 ? images : [image, image, image, image],
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
