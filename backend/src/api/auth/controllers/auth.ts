export default {
  async initializeOtp(ctx) {
    try {
      const { phoneNumber } = ctx.request.body;

      if (!phoneNumber) {
        return ctx.badRequest('Phone number is required');
      }

      // Simulate sending OTP
      console.log(`Simulated OTP sent to ${phoneNumber}: 123456`);

      // Return a mock verification ID
      return {
        success: true,
        verificationId: `mock-verification-id-${phoneNumber}`,
      };
    } catch (error) {
      console.error('OTP initialization error:', error);
      return ctx.badRequest(error.message);
    }
  },

  async verifyOtp(ctx) {
    try {
      const { verificationId, otp, phoneNumber } = ctx.request.body;

      if (!verificationId || !otp || !phoneNumber) {
        return ctx.badRequest('Verification ID, OTP, and phone number are required');
      }

      // Simulate OTP verification
      if (otp !== '123456') {
        return ctx.badRequest('Invalid OTP for ' + phoneNumber);
      }

      if (verificationId !== `mock-verification-id-${phoneNumber}`) {
        return ctx.badRequest('Invalid verification ID');
      }

      // Check if user exists in Strapi
      let strapiUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { phoneNumber },
      });

      if (!strapiUser) {
        // Return success but indicate user needs to sign up
        return {
          success: true,
          needsSignup: true,
        };
      }

      // Generate JWT token using users-permissions plugin
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: strapiUser.id,
        documentId: strapiUser.documentId,
        phoneNumber: strapiUser.phoneNumber
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: strapiUser.id,
        documentId: strapiUser.documentId,
        email: strapiUser.email,
        firstName: strapiUser.firstName,
        lastName: strapiUser.lastName,
        phoneNumber: strapiUser.phoneNumber,
        role: {}
      };

      return {
        success: true,
        needsSignup: false,
        jwt: token,
        user: sanitizedUser
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return ctx.badRequest(error.message);
    }
  },

  async signup(ctx) {
    try {
      const {
        email, 
        phoneNumber,
        firstName,
        lastName,
        gender
      } = ctx.request.body;

      // Validate required fields
      if (!phoneNumber) {
        return ctx.badRequest('Phone number is required');
      }

      // Check if user already exists
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { email },
            { phoneNumber }
          ]
        }
      });

      if (existingUser) {
        return ctx.badRequest('User with this email, username, or phone number already exists');
      }

      // Create new user
      const newUser = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: phoneNumber,
          email,
          password: Math.random().toString(36).substring(2, 15),
          phoneNumber,
          firstName,
          lastName,
          gender,
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: {
            connect: [1]
          }
        }
      });

      // Generate JWT token using users-permissions plugin
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: newUser.id,
        documentId: newUser.documentId,
        phoneNumber: newUser.phoneNumber
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: newUser.id,
        documentId: newUser.documentId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role
      };

      return {
        success: true,
        jwt: token,
        user: sanitizedUser
      };
    } catch (error) {
      console.error('Signup error:', error);
      return ctx.badRequest(error.message);
    }
  },

  async verifyToken(ctx) {
    try {
      const { token } = ctx.request.body;

      if (!token) {
        return ctx.badRequest('Token is required');
      }

      // Verify the JWT token using users-permissions plugin
      const decodedToken = await strapi.plugins['users-permissions'].services.jwt.verify(token);

      if (!decodedToken || !decodedToken.id || !decodedToken.phoneNumber) {
        return ctx.unauthorized('Invalid token or token expired ' + decodedToken);
      }

      // Find the user using entity service
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { documentId: decodedToken.documentId },
            { phoneNumber: decodedToken.phoneNumber }
          ]
        },
        populate: ['role']
      });

      const strapiUser = users?.[0];

      if (!strapiUser) {
        return ctx.unauthorized('User not found');
      }

      // Remove sensitive data
      const sanitizedUser = {
        id: strapiUser.id,
        documentId: strapiUser.documentId,
        email: strapiUser.email,
        firstName: strapiUser.firstName,
        lastName: strapiUser.lastName,
        phoneNumber: strapiUser.phoneNumber,
        role: strapiUser.role
      };

      return {
        success: true,
        jwt: token,
        user: sanitizedUser
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return ctx.unauthorized('Invalid token');
    }
  },

  async attendantLogin(ctx) {
    try {
      const { identifier, password } = ctx.request.body;

      if (!identifier || !password) {
        return ctx.badRequest('Please provide both identifier and password');
      }

      // Find the user using entity service
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { email: identifier },
            { username: identifier },
            { phoneNumber: identifier }
          ]
        },
        populate: ['role']
      });

      const user = users?.[0];

      if (!user) {
        return ctx.unauthorized('Invalid credentials');
      }

      // Check if user is an Attendant
      if (user.role?.name !== 'Attendant') {
        return ctx.unauthorized('Only attendants can access this login');
      }

      // Verify password
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);
      if (!validPassword) {
        return ctx.unauthorized('Invalid credentials');
      }

      // Generate JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        documentId: user.documentId,
        phoneNumber: user.phoneNumber
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role
      };

      return {
        jwt: token,
        user: sanitizedUser
      };
    } catch (error) {
      console.error('Attendant login error:', error);
      return ctx.badRequest(error.message || 'Internal server error');
    }
  },

  async changeAttendantPassword(ctx) {
    try {
      const { currentPassword, newPassword } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!currentPassword || !newPassword) {
        return ctx.badRequest('Please provide both current and new password');
      }

      // Find the user
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['role']
      });

      if (!user) {
        return ctx.notFound('User not found');
      }

      // Verify user is an attendant
      if (user.role?.name !== 'Attendant') {
        return ctx.unauthorized('Only attendants can change their password');
      }

      // Verify current password
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
        currentPassword,
        user.password
      );

      if (!validPassword) {
        return ctx.unauthorized('Current password is incorrect');
      }

      // Update password using users-permissions service
      await strapi.plugins['users-permissions'].services.user.edit(userId, {
        password: newPassword
      });

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return ctx.badRequest(error.message || 'Internal server error');
    }
  }
}; 