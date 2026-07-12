const authService = require('./auth.service');
const { sendSuccess } = require('../common/response');
const { z } = require('zod');

// We use controller-level catch wrappers in Express if not using express-async-errors
// or simply handle promises. Let's do a simple async wrapper.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return sendSuccess(res, result, 'Login successful');
});

const register = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.register(email, password, role);
  return sendSuccess(res, result, 'Registration successful', 201);
});

// Zod schemas for validation
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().optional()
  })
});

module.exports = {
  login,
  register,
  loginSchema,
  registerSchema
};
