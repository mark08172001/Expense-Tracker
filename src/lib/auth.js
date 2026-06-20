import supabase from './supabase.js';
import Utils from './utils.js';

const Auth = {
  user: null,
  session: null,

  async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.session = session;
      this.user = session.user;
      return true;
    }
    return false;
  },

  async register(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      Utils.showToast(error.message, 'error');
      throw error;
    }

    this.user = data.user;
    this.session = data.session;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          password_hash: ''
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return data;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      Utils.showToast(error.message, 'error');
      throw error;
    }

    this.user = data.user;
    this.session = data.session;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Utils.showToast(error.message, 'error');
      throw error;
    }
    this.user = null;
    this.session = null;
    window.location.href = '/';
  },

  getUser() {
    return this.user;
  },

  isAuthenticated() {
    return this.user !== null;
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/';
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default Auth;
