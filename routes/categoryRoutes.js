const express = require("express");
const router = express.Router();
const Product = require("../models/products"); 

// Main category routes
router.get("/:category", async (req, res) => {
    const { category } = req.params;

    try {
        const products = await Product.find({ category: category });
        res.render(category, { products }); 
    } catch (error) {
        console.error("Error fetching category products:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Women subcategories
router.get("/women/:subcategory", async (req, res) => {
    const { subcategory } = req.params;

    try {
        const products = await Product.find({ category: "Women", subcategory: subcategory });
        res.render(`women/${subcategory}`, { products }); // Render the correct subcategory view
    } catch (error) {
        console.error("Error fetching subcategory products:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/women/bags", async (req, res) => {
    try {
        const products = await Product.find({ category: "bags" }); // Fetch products from database
        res.render("women/bags", { products }); // Pass products to the EJS file
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
