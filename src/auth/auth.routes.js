const express = require('express');
const authController = require('./auth.controller');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validate(authController.loginSchema), authController.login);
router.post('/register', validate(authController.registerSchema), authController.register);

// Example of a protected route using authMiddleware (can be moved elsewhere later)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;
