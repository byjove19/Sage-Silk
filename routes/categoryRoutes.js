const express = require("express");
const router = express.Router();
const Product = require("../models/products");

// Helper function to handle category rendering
async function renderCategory(req, res, category, subcategory = null) {
  try {
    const query = { category };
    if (subcategory) {
      query.subcategory = subcategory;
      // Handle case-sensitivity for subcategories
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }
    
    const products = await Product.find(query);
    
    if (!products.length && subcategory) {
      return res.status(404).render('404');
    }
    
    const viewPath = subcategory 
      ? `${category.toLowerCase()}/${subcategory.toLowerCase()}`
      : category.toLowerCase();
      
    res.render(viewPath, { 
      products, 
      user: req.user,
      category,
      subcategory
    });
  } catch (err) {
    console.error(`Error fetching ${category} products:`, err);
    res.status(500).render("500");
  }
}


// Men's Collection
router.get("/men", (req, res) => renderCategory(req, res, "Men"));
router.get("/men/:subcategory", (req, res) => 
  renderCategory(req, res, "Men", req.params.subcategory)
);

// Women's Collection
router.get("/women", (req, res) => renderCategory(req, res, "Women"));
router.get("/women/:subcategory", (req, res) => 
  renderCategory(req, res, "Women", req.params.subcategory)
);

// Kids Collection
router.get("/kids", (req, res) => renderCategory(req, res, "Kids"));
router.get("/kids/:subcategory", (req, res) => 
  renderCategory(req, res, "Kids", req.params.subcategory)
);

// Accessories
router.get("/accessories", (req, res) => renderCategory(req, res, "Accessories"));
router.get("/accessories/:subcategory", (req, res) => 
  renderCategory(req, res, "Accessories", req.params.subcategory)
);

// Wigs & Haircare
router.get("/wigs", (req, res) => renderCategory(req, res, "Wigs"));
router.get("/wigs/:subcategory", (req, res) => 
  renderCategory(req, res, "Wigs", req.params.subcategory)
);

// Makeup & Skincare
router.get("/makeup", (req, res) => renderCategory(req, res, "Makeup"));
router.get("/makeup/:subcategory", (req, res) => 
  renderCategory(req, res, "Makeup", req.params.subcategory)
);

module.exports = router;