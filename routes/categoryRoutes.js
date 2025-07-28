const express = require("express");
const router = express.Router();
const Product = require("../models/products");

// Helper function to handle category rendering
async function renderCategory(req, res, category, subcategory = null) {
  try {
    const query = { category };
    if (subcategory) {
      query.subcategory = subcategory;
    }
    const products = await Product.find(query);
    res.render(`${category.toLowerCase()}${subcategory ? `/${subcategory}` : ''}`, { 
      products, 
      user: req.user 
    });
  } catch (err) {
    console.error(`Error fetching ${category} products:`, err);
    res.status(500).render("500");
  }
}

// Men's Collection Routes
router.get("/men", (req, res) => renderCategory(req, res, "Men"));
router.get("/men/formal-business", (req, res) => renderCategory(req, res, "Men", "formal-business"));
router.get("/men/casual-seasonal", (req, res) => renderCategory(req, res, "Men", "casual-seasonal"));

// Women's Collection Routes
router.get("/women", (req, res) => renderCategory(req, res, "Women"));
router.get("/women/bags", (req, res) => renderCategory(req, res, "Women", "bags"));
router.get("/women/jumpsuits", (req, res) => renderCategory(req, res, "Women", "jumpsuits"));
router.get("/women/makeup", (req, res) => renderCategory(req, res, "Women", "makeup"));
router.get("/women/blouses-tops", (req, res) => renderCategory(req, res, "Women", "blouses-tops"));
router.get("/women/dinner-gowns", (req, res) => renderCategory(req, res, "Women", "dinner-gowns"));
router.get("/women/footwears", (req, res) => renderCategory(req, res, "Women", "footwears"));
router.get("/women/jackets", (req, res) => renderCategory(req, res, "Women", "jackets"));
router.get("/women/skin-care", (req, res) => renderCategory(req, res, "Women", "skin-care"));
router.get("/women/skirts-pants", (req, res) => renderCategory(req, res, "Women", "skirts-pants"));
router.get("/women/two-pieces", (req, res) => renderCategory(req, res, "Women", "two-pieces"));
router.get("/women/wigs", (req, res) => renderCategory(req, res, "Women", "wigs"));
router.get("/women/jeans", (req, res) => renderCategory(req, res, "Women", "jeans"));
router.get("/women/dresses-and-gowns", (req, res) => renderCategory(req, res, "Women", "dresses-and-gowns"));

// Kid's Collection Routes
router.get("/kids", (req, res) => renderCategory(req, res, "kids"));
router.get("/kids/clothing", (req, res) => renderCategory(req, res, "Kids", "clothing"));
router.get("/kids/seasonal-ethnic", (req, res) => renderCategory(req, res, "Kids", "seasonal-ethnic"));

// Accessories Routes
router.get("/accessories", (req, res) => renderCategory(req, res, "Accessories"));
router.get("/accessories/fashion", (req, res) => renderCategory(req, res, "Accessories", "fashion"));
router.get("/accessories/beauty-hair", (req, res) => renderCategory(req, res, "Accessories", "beauty-hair"));

// Wigs & Haircare Routes
router.get("/wigs", (req, res) => renderCategory(req, res, "Wigs"));
router.get("/wigs/wigs", (req, res) => renderCategory(req, res, "Wigs", "wigs"));
router.get("/wigs/haircare", (req, res) => renderCategory(req, res, "Wigs", "haircare"));

// Makeup & Skincare Routes
router.get("/makeup", (req, res) => renderCategory(req, res, "Makeup"));
router.get("/makeup/makeup", (req, res) => renderCategory(req, res, "Makeup", "makeup"));
router.get("/makeup/skincare", (req, res) => renderCategory(req, res, "Makeup", "skincare"));

module.exports = router;