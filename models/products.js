const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Men', 'Women', 'Kids', 'Accessories', 'Wigs', 'Makeup']
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Product', productSchema);