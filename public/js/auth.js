/**
 * Authentication Module
 */

import API from './api.js';
import Utils from './utils.js';

const Auth = {
    user: null,

    /**
     * Initialize auth
     */
    async init() {
        try {
            const response = await API.auth.checkAuth();
            if (response.authenticated) {
                this.user = response.user;
                return true;
            }
        } catch (error) {
            // User not authenticated
        }
        return false;
    },

    /**
     * Register new user
     */
    async register(email, password, fullName) {
        try {
            const response = await API.auth.register(email, password, fullName);
            this.user = response.user;
            return response;
        } catch (error) {
            Utils.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await API.auth.login(email, password);
            this.user = response.user;
            return response;
        } catch (error) {
            Utils.showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await API.auth.logout();
            this.user = null;
            window.location.href = 'index.html';
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    },

    /**
     * Get current user
     */
    getUser() {
        return this.user;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.user !== null;
    },

    /**
     * Require authentication
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }
};

export default Auth;
