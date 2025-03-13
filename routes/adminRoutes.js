const express = require('express');
const router = express.Router();

// route for admin panel
router.get('/admin', (req, res) => {
    res.send('Admin Dashboard');
});

module.exports = router;
