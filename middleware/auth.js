const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Make sure to import your User model

module.exports = {
    ensureAuthenticated: (req, res, next) => {
        const token = req.cookies.sagesilkapp;
        
        if (!token) {
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.locals.user = decoded;
            next();
        } catch (err) {
            res.clearCookie('sagesilkapp');
            res.redirect('/login');
        }
    },

    ensureAdmin: async (req, res, next) => {
        const token = req.cookies.sagesilkapp;
        
        if (!token) {
            return res.redirect('/admin/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId); // Changed to findById
            
            if (!user || user.role !== 'admin') {
                req.flash('error', 'Admin access required');
                res.clearCookie('sagesilkapp');
                return res.redirect('/admin/login');
            }
            
            req.user = user;
            res.locals.user = user;
            next();
        } catch (error) {
            console.error('Admin verification error:', error);
            res.clearCookie('sagesilkapp');
            res.redirect('/admin/login');
        }
    }
};