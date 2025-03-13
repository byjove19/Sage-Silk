const express = require('express');
const Product = require('../models/products'); 
const router = express.Router();

router.get('/', async (req, res) => {
  try {
      const products = await Product.find();
      console.log("Fetched products:", products); // Debugging line

      res.render('product', { products }); 
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get a product by ID
router.get("/product/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      res.render("product-detail", { product }); 
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Server error" });
  }
});



// Route to get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get("/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).send("Product not found");
      }
      res.render("product-details", { product }); // Render a new product details page
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Server error", error });
  }
});
// Route to get products by category and subcategory
router.get('/products/:category/:subcategory', async (req, res) => {
    const { category, subcategory } = req.params;
    try {
        const products = await Product.find({ category, subcategory });
        res.render('women/bags', { products }); // Render the template with the filtered products
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res) => {
  try {
      const { name, price, oldPrice, sku, image, description, category, subcategory } = req.body;

      if (!category || !subcategory) {
          return res.status(400).json({ message: "Category and subcategory are required." });
      }

      const newProduct = new Product({
          name,
          description,
          price: parseFloat(price.replace(/[#,]/g, '')), // Remove # and commas
          oldPrice: parseFloat(oldPrice.replace(/[#,]/g, '')), // Remove # and commas
          sku,
          category, // Now dynamic
          subcategory, // Now dynamic
          images: [image, image, image, image], // Example: 4 duplicate images (adjust as needed)
          stock: 10, // Default stock
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
