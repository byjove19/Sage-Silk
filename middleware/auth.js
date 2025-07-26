const jwt = require('jsonwebtoken');

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

    ensureAdmin: (req, res, next) => {
        const token = req.cookies.sagesilkapp;
        
        if (!token) {
            return res.redirect('/admin/login');
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                res.clearCookie('sagesilkapp');
                return res.redirect('/admin/login');
            }

            try {
                const user = await User.findOne({ username: decoded.username });
                if (!user || user.role !== 'admin') {
                    req.flash('error', 'Admin access required');
                    return res.redirect('/admin/login');
                }
                
                req.user = user;
                res.locals.user = user;
                next();
            } catch (error) {
                console.error('Admin verification error:', error);
                res.redirect('/admin/login');
            }
        });
    }
};