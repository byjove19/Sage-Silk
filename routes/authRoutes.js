const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/user');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

// Function to generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
            username: user.username,
            role: user.role 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { username: user.username },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

// Regular User Routes
router.get('/signup', (req, res) => res.render('signup', { errors: [] }));

router.post('/signup', async (req, res) => {
    const { username, email, password, role = 'user' } = req.body;
    const errors = [];

    if (!username || !email || !password) errors.push('Please fill in all fields.');

    const existingUser = await User.findOne({ username });
    if (existingUser) errors.push('This username is already taken.');

    const existingEmail = await User.findOne({ email });
    if (existingEmail) errors.push('This email is already registered.');

    if (errors.length) return res.render('signup', { errors });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword,
            role 
        });
        await newUser.save();

        const { accessToken, refreshToken } = generateTokens(newUser);

        res.cookie('sagesilkapp', accessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
        });
        res.cookie('sagesilkrefresh', refreshToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        // Redirect based on role
        if (newUser.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/welcome');
        }
    } catch (error) {
        console.error(error);
        res.render('signup', { errors: ['Signup failed. Please try again.'] });
    }
});

// Admin Login Routes
router.get('/admin/login', (req, res) => {
    res.render('admin/login', { 
        errors: req.flash('error') || [] 
    });
});


router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        req.flash('error', 'Username and password are required');
        return res.redirect('/admin/login');
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/admin/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/admin/login');
        }

        if (user.role !== 'admin') {
            req.flash('error', 'Admin access required');
            return res.redirect('/admin/login');
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie('sagesilkapp', accessToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
        });
        res.cookie('sagesilkrefresh', refreshToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Admin login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/admin/login');
    }
});

// Regular Login Routes
router.get('/login', (req, res) => res.render('login', { errors: [] }));

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('login', { errors: ['Username and password are required.'] });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { errors: ['Invalid username or password.'] });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { errors: ['Invalid username or password.'] });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie('sagesilkapp', accessToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
        });
        res.cookie('sagesilkrefresh', refreshToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/welcome');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { errors: ['An error occurred during login.'] });
    }
});

// Token Refresh Route
router.post('/auth/refresh', (req, res) => {
    const refreshToken = req.cookies.sagesilkrefresh;
    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid refresh token' });

        const newAccessToken = jwt.sign(
            { username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        res.cookie('sagesilkapp', newAccessToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 
        });
        res.json({ accessToken: newAccessToken });
    });
});

// Logout Route
router.get('/logout', (req, res) => {
    res.clearCookie('sagesilkapp');
    res.clearCookie('sagesilkrefresh');
    res.redirect('/login');
});

router.get('/admin/logout', (req, res) => {
    res.clearCookie('sagesilkapp');
    res.clearCookie('sagesilkrefresh');
    res.redirect('/admin/login');
});

module.exports = router;