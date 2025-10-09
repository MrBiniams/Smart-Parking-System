/**
 * user controller
 */

import { factories } from '@strapi/strapi'
import { Context } from 'koa';
import jwt from 'jsonwebtoken';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async find(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },

  async create(ctx) {
    // Add custom logic here if needed
    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      if (!data) {
        ctx.throw(400, 'Missing data in request body');
      }

      // Update the user using entityService
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', id, {
        data
      });

      // Return sanitized user data
      const sanitizedUser = {
        id: updatedUser.id,
        documentId: updatedUser.documentId,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        isPhoneVerified: updatedUser.isPhoneVerified,
        role: updatedUser.role,
        userSettings: updatedUser.userSettings,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      ctx.body = sanitizedUser;
    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async delete(ctx) {
    // Add custom logic here if needed
    const response = await super.delete(ctx);
    return response;
  },

  async login(ctx: Context) {
    try {
      const { identifier, password } = ctx.request.body;

      if (!identifier || !password) {
        ctx.throw(400, 'Please provide both identifier and password');
      }

      // Find the user using entity service
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });

      const user = users?.[0];

      if (!user) {
        ctx.throw(401, 'Invalid credentials');
      }

      // Verify password
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);
      if (!validPassword) {
        ctx.throw(401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          documentId: user.documentId,
          isAdmin: user.isAdmin || false
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '1d' }
      );

      // Remove sensitive data
      const sanitizedUser = {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        userSettings: user.userSettings
      };

      ctx.body = {
        token: token,
        user: sanitizedUser
      };

    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async register(ctx: Context) {
    try {
      const { username, email, password, phoneNumber, firstName, lastName } = ctx.request.body;

      if (!username || !password || !phoneNumber || !firstName || !lastName) {
        ctx.throw(400, 'Please provide username, password, and phone number');
      }

      // Check if user already exists
      const existingUser = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { email },
            { username },
            { phoneNumber }
          ]
        }
      });

      if (existingUser.length > 0) {
        ctx.throw(400, 'Username, email, or phone number already exists');
      }

      // Create user
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: {
          username,
          email,
          password: password,
          phoneNumber,
          firstName,
          lastName,
          confirmed: true,
          blocked: false,
          provider: 'local'
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          isAdmin: user.isAdmin || false
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '1d' }
      );

      // Remove sensitive data
      const sanitizedUser = {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        userSettings: user.userSettings
      };

      ctx.body = {
        message: 'User registered successfully',
        user: sanitizedUser,
        token: token
      };

    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async getCurrentUser(ctx: Context) {
    try {
      console.log(ctx.state);
      const user = ctx.state.user;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }

      // Remove sensitive data
      const sanitizedUser = {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        userSettings: user.userSettings
      };

      ctx.body = sanitizedUser;

    } catch (error) {
      ctx.throw(error.status || 500, 'This is the error');
    }
  },

  async updateProfile(ctx: Context) {
    try {
      const user = ctx.state.user;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }

      // Get the update data from request body
      const { firstName, lastName, email, gender } = ctx.request.body;

      // Update the user directly using entityService
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          firstName,
          lastName,
          email,
          gender
        } as any
      });

      // Remove sensitive data
      const sanitizedUser = {
        id: updatedUser.id,
        documentId: updatedUser.documentId,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        role: updatedUser.role,
        userSettings: updatedUser.userSettings
      };

      ctx.body = sanitizedUser;

    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async checkPermission(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { permission } = ctx.request.body;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }

      if (!user.role?.permissions) {
        ctx.body = { hasPermission: false };
        return;
      }

      ctx.body = {
        hasPermission: user.role.permissions.includes(permission)
      };

    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async checkPermissions(ctx: Context) {
    try {
      const user = ctx.state.user;
      const { permissions } = ctx.request.body;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }

      if (!user.role?.permissions) {
        ctx.body = { hasAllPermissions: false };
        return;
      }

      ctx.body = {
        hasAllPermissions: permissions.every(permission => 
          user.role.permissions.includes(permission)
        )
      };

    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  },

  async me(ctx: Context) {
    try {
      const user = ctx.state.user;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }

      // Return sanitized user data
      const sanitizedUser = {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        userSettings: user.userSettings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      ctx.body = sanitizedUser;
    } catch (error) {
      ctx.throw(error.status || 500, error.message || 'Internal server error');
    }
  }
})); 