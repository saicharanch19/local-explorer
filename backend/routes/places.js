const express = require('express');
const router = express.Router();

// Test API route
router.get('/', (req, res) => {
    res.json({ message: '🌍 Local Explorer API is working!' });
});

module.exports = router;
