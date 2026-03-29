const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

class AuthService extends BaseService {
  constructor() {
    super(User);
  }

  // Generate JWT
  signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }


  // Create send token response
  createSendToken(user, statusCode, res) {
    const token = this.signToken(user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
    res.cookie('jwt', token, cookieOptions);
    // Remove password from output
    user.password = undefined;
    return { token, user };
  }

  // Register new user
  async register(userData) {
    // Validate allowed roles
    const allowedRoles = ['student', 'institution_rep', 'counsellor'];
    if (userData.role && !allowedRoles.includes(userData.role)) {
      throw new AppError('Invalid role selected', 400);
    }
    // Default to student if not provided
    if (!userData.role) userData.role = 'student';

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new AppError('Email already registered', 400);

    // Create user (role will be saved)
    const user = await this.create(userData);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Send verification email (fire-and-forget — don't block the response)
    const clientUrl = process.env.CLIENT_URL || 'https://campusgarh.onrender.com';
    const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;
    console.log(`[AUTH] ✉ Verification URL for ${user.email}: ${verificationUrl}`);

    emailService.sendEmail({
      to: user.email,
      subject: 'Verify your email - CampusGarh',
      template: 'verification',
      context: { name: user.name, url: verificationUrl },
    }).then(() => {
      console.log(`[AUTH] ✅ Verification email sent to ${user.email}`);
    }).catch((err) => {
      console.error(`[AUTH] ❌ Email send failed for ${user.email}:`, err.message);
    });

    return { user: user.toObject(), message: 'Registration successful. Please verify your email.' };
  }

  // Login
  async login(email, password) {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is active
    if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 401);

    // Check if email is verified (only enforced when ENFORCE_EMAIL_VERIFICATION=true in env)
    if (process.env.ENFORCE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
      throw new AppError('Please verify your email before logging in.', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = this.signToken(user._id);
    user.password = undefined;
    return { token, user };
  }

  // Verify email
  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Invalid or expired token', 400);

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return { message: 'Email verified successfully' };
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('No user with that email', 404);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email (fire-and-forget — don't block the response)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV] 🔑 Password reset for ${user.email}:\n  ${resetUrl}\n`);
    }
    emailService.sendEmail({
      to: user.email,
      subject: 'Password reset - CampusGarh',
      template: 'passwordReset',
      context: { name: user.name, url: resetUrl },
    }).catch(() => {/* SMTP not configured — safe to ignore */});

    return { message: 'Reset link sent to email' };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Invalid or expired token', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  // Change password (logged in)
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 401);
    }
    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  // OAuth login (Google)
  async oAuthLogin(profile) {
    // First try to find by googleId, then by email
    let user = await User.findOne({ googleId: profile.googleId });
    
    if (!user) {
      user = await User.findOne({ email: profile.email });
    }
    if (!user) {
      // Create new user from OAuth profile
      user = await this.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        oauthProvider: 'google',
        emailVerified: true,
        password: crypto.randomBytes(20).toString('hex'), // dummy password - not used for OAuth
      });
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = profile.googleId;
      user.oauthProvider = 'google';
      if (!user.emailVerified) user.emailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 401);

    const token = this.signToken(user._id);
    user.password = undefined;
    return { token, user };
  }
  
}

module.exports = new AuthService();