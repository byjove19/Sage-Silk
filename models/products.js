const mongoose = require('mongoose');

// Utility to generate slug from name
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true }, 
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Men', 'Women', 'Kids', 'Makeup', 'Wigs', 'Accessories', 'Skincare', 'Scents']
    },
    subcategory: { type: String, required: true },
    images: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length === 4;
            },
            message: 'Each product must have exactly 4 images.'
        },
        required: true
    },
    stock: { type: Number, required: true, default: 0 },
    brand: { type: String },
    ratings: {
        average: { type: Number, default: 0 },
        reviews: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, required: true },
            comment: { type: String }
        }]
    },
    createdAt: { type: Date, default: Date.now }
});

// 🔁 Automatically generate slug before saving
productSchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = slugify(this.name, { lower: true, strict: true });
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
