export default {
  async initializeOtp(ctx) {
    try {
      const { phoneNumber } = ctx.request.body;

      if (!phoneNumber) {
        return ctx.badRequest('Phone number is required');
      }

      // Simulate sending OTP
      // In production, integrate with real SMS service

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

      // Get user with role information
      const userWithRole = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: strapiUser.id },
        populate: ['role']
      });

      // Generate JWT token using users-permissions plugin
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: strapiUser.id,
        documentId: strapiUser.documentId,
        phoneNumber: strapiUser.phoneNumber
      });

      // Check if this is an incomplete profile created by attendant
      const isIncompleteProfile = strapiUser.email && 
                                 strapiUser.email.includes('@temp.com') && 
                                 strapiUser.username && 
                                 strapiUser.username.startsWith('user_+') &&
                                 (!strapiUser.firstName || !strapiUser.lastName);

      // Remove sensitive data
      const sanitizedUser = {
        id: strapiUser.id,
        documentId: strapiUser.documentId,
        email: strapiUser.email,
        firstName: strapiUser.firstName,
        lastName: strapiUser.lastName,
        phoneNumber: strapiUser.phoneNumber,
        role: userWithRole.role
      };

      return {
        success: true,
        needsSignup: false,
        needsProfileCompletion: isIncompleteProfile, // New flag
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
            { phoneNumber }
          ]
        }
      });

      if (existingUser) {
        // Check if this is an incomplete user created by attendant booking
        const isIncompleteUser = existingUser.email && 
                                existingUser.username && 
                                existingUser.username.startsWith('user_+');
        
        if (isIncompleteUser) {
          // Get the Authenticated role dynamically
          const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
            where: { type: 'authenticated' }
          });

          if (!authenticatedRole) {
            return ctx.badRequest('Authenticated role not found');
          }

          // Update the incomplete user with complete profile data
          const updatedUser = await strapi.query('plugin::users-permissions.user').update({
            where: { id: existingUser.id },
            data: {
              username: firstName, // Use firstName as username
              email,
              firstName,
              lastName,
              gender,
              confirmed: true,
              blocked: false,
              role: {
                connect: [authenticatedRole.id] // Use correct Authenticated role ID
              }
            }
          });

          // Generate JWT token
          const token = strapi.plugins['users-permissions'].services.jwt.issue({
            id: updatedUser.id,
            documentId: updatedUser.documentId,
            phoneNumber: updatedUser.phoneNumber
          });

          // Remove sensitive data
          const sanitizedUser = {
            id: updatedUser.id,
            documentId: updatedUser.documentId,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role
          };

          return {
            success: true,
            jwt: token,
            user: sanitizedUser,
            message: 'Profile completed successfully'
          };
        }
        
        return ctx.badRequest('User with this email, username, or phone number already exists');
      }

      // Create new user
      const newUser = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: firstName, // Use firstName as username
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
            connect: [2]
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

  async completeProfile(ctx) {
    try {
      const {
        email, 
        firstName,
        lastName,
        gender
      } = ctx.request.body;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

      // Validate required fields
      if (!email || !firstName || !lastName || !gender) {
        return ctx.badRequest('All fields are required: email, firstName, lastName, gender');
      }

      // Find the current user
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId }
      });

      if (!existingUser) {
        return ctx.notFound('User not found');
      }

      // Check if this is indeed an incomplete profile
      const isIncompleteProfile = existingUser.email && 
                                 existingUser.email.includes('@temp.com') && 
                                 existingUser.username && 
                                 existingUser.username.startsWith('user_+');

      if (!isIncompleteProfile) {
        return ctx.badRequest('Profile is already complete');
      }

      // Get Authenticated role dynamically
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (!authenticatedRole) {
        return ctx.badRequest('Authenticated role not found');
      }

      // Update the user profile and assign Authenticated role
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: {
          username: firstName, // Use firstName as username
          email,
          firstName,
          lastName,
          gender,
          confirmed: true,
          blocked: false,
          role: {
            connect: [authenticatedRole.id] // Assign Authenticated role dynamically
          }
        }
      });

      // Generate new JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: updatedUser.id
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: updatedUser.id,
        documentId: updatedUser.documentId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role
      };


      return {
        success: true,
        jwt: token,
        user: sanitizedUser,
        message: 'Profile completed successfully'
      };
    } catch (error) {
      console.error('Profile completion error:', error);
      return ctx.badRequest(error.message);
    }
  },

  async editProfile(ctx) {
    try {
      const {
        email, 
        firstName,
        lastName,
        gender
      } = ctx.request.body;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

      // Validate required fields
      if (!email || !firstName || !lastName || !gender) {
        return ctx.badRequest('All fields are required: email, firstName, lastName, gender');
      }

      // Find the current user
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: ['role']
      });

      if (!existingUser) {
        return ctx.notFound('User not found');
      }

      // Check if this is a complete profile (not temp user)
      const isCompleteProfile = existingUser.email && 
                               !existingUser.email.includes('@temp.com') && 
                               existingUser.firstName && 
                               existingUser.lastName;

      if (!isCompleteProfile) {
        return ctx.badRequest('Use complete-profile endpoint for incomplete profiles');
      }

      // Validate email uniqueness (exclude current user)
      const emailExists = await strapi.query('plugin::users-permissions.user').findOne({
        where: { 
          email: email,
          id: { $ne: userId }
        }
      });

      if (emailExists) {
        return ctx.badRequest('Email is already in use by another user');
      }

      // Update the user profile including username
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: {
          username: firstName, // Set username to firstName
          email,
          firstName,
          lastName,
          gender,
        }
      });

      // Generate new JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: updatedUser.id
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: updatedUser.id,
        documentId: updatedUser.documentId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role
      };


      return {
        success: true,
        jwt: token,
        user: sanitizedUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile edit error:', error);
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
        return ctx.unauthorized('Phone number or email not found. Please check your credentials.');
      }

      // Check if user is an Attendant
      if (user.role?.name !== 'Attendant') {
        return ctx.unauthorized('This account is not registered as an attendant. Please contact your administrator.');
      }

      // Verify password
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);
      if (!validPassword) {
        return ctx.unauthorized('Incorrect password. Please try again.');
      }

      // Generate JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
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
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

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