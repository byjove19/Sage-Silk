// controllers/adminController.js
const Product = require('../models/products');

exports.getAddProduct = (req, res) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        categories: ['Men', 'Women', 'Kids', 'Makeup', 'Wigs', 'Accessories', 'Skincare', 'Scents']
    });
};

exports.postAddProduct = async (req, res) => {
    try {
        const { name, description, price, category, subcategory, brand, stock } = req.body;
        
        // Assuming you're using multer or similar for file uploads
        const images = req.files.map(file => file.path);
        
        const product = new Product({
            name,
            description,
            price,
            category,
            subcategory,
            images,
            brand,
            stock
        });

        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).render('admin/add-product', {
            pageTitle: 'Add Product',
            error: 'Failed to add product'
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/products', {
            pageTitle: 'Admin Products',
            products
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).render('error', { error: 'Failed to load products' });
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.redirect('/admin/products');
        }
        
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            product,
            categories: ['Men', 'Women', 'Kids', 'Makeup', 'Wigs', 'Accessories', 'Skincare', 'Scents']
        });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.redirect('/admin/products');
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        const { name, description, price, category, subcategory, brand, stock } = req.body;
        const productId = req.params.id;
        
        let images;
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.redirect('/admin/products');
        }
        
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.subcategory = subcategory;
        product.brand = brand;
        product.stock = stock;
        if (images) {
            product.images = images;
        }
        
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error updating product:', err);
        res.redirect('/admin/products');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};