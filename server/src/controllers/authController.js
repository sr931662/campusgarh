const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  // Register a new user
  register = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.error(res, { message: 'Validation error', details: errors.array() }, 400);
    }
    const result = await authService.register(req.body);
    ResponseHandler.success(res, result.user, result.message, 201);
  });

  // Login user
  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    // Set cookie for JWT (optional)
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    });
    ResponseHandler.success(res, { user: result.user, token: result.token }, 'Login successful');
  });

  // Logout
  logout = catchAsync(async (req, res) => {
    res.clearCookie('jwt');
    ResponseHandler.success(res, null, 'Logged out successfully');
  });

  // Verify email
  verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    ResponseHandler.success(res, null, result.message);
  });

  // Forgot password - send reset link
  forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    ResponseHandler.success(res, null, result.message);
  });

  // Reset password
  resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword(token, password);
    ResponseHandler.success(res, null, result.message);
  });

  // Change password (authenticated)
  changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    ResponseHandler.success(res, null, result.message);
  });

  // OAuth login callback (Google)
  oauthCallback = catchAsync(async (req, res) => {
    const { credential } = req.body;
    if (!credential) return ResponseHandler.error(res, { message: 'Google credential required' }, 400);

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const profile = {
      googleId:       payload.sub,
      email:          payload.email,
      name:           payload.name,
      profilePicture: payload.picture,
    };

    const result = await authService.oAuthLogin(profile);
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    });
    ResponseHandler.success(res, { user: result.user, token: result.token }, 'Google login successful');
  });

}

module.exports = new AuthController();