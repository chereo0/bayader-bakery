const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Dev-only: return decoded token info for the current request
router.get('/me', auth, async (req, res) => {
  return res.json({ success: true, data: { user: req.user } });
});

// Dev-only: echo request headers (helpful to verify Authorization header)
router.get('/headers', (req, res) => {
  const headers = Object.assign({}, req.headers);
  return res.json({ success: true, data: { headers } });
});

module.exports = router;
