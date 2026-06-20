import supabase from './supabase.js';

const API = {
  auth: {
    async getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        createdAt: data.created_at
      };
    },

    async updateProfile(fullName, password = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('users')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }

      return { success: true };
    }
  },

  categories: {
    async list(type = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { categories: [] };

      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        categories: data.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon,
          createdAt: c.created_at
        }))
      };
    },

    async create(category) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          type: category.type,
          icon: category.icon || '📌'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        category: {
          id: data.id,
          name: data.name,
          type: data.type,
          icon: data.icon,
          createdAt: data.created_at
        }
      };
    },

    async update(id, category) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = { updated_at: new Date().toISOString() };
      if (category.name) updateData.name = category.name;
      if (category.icon) updateData.icon = category.icon;

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    },

    async delete(id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    }
  },

  transactions: {
    async create(transaction) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: transaction.categoryId,
          amount: transaction.amount,
          transaction_type: transaction.type,
          payment_method: transaction.paymentMethod || null,
          transaction_date: transaction.date,
          notes: transaction.notes || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        transaction: data
      };
    },

    async list(filters = {}) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { transactions: [], count: 0 };

      let query = supabase
        .from('transactions')
        .select('*, categories(id, name, icon, type)', { count: 'exact' })
        .eq('user_id', user.id);

      if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.type) {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      query = query.order('transaction_date', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data.map(t => ({
          id: t.id,
          categoryId: t.category_id,
          category: t.categories,
          amount: t.amount,
          transaction_type: t.transaction_type,
          payment_method: t.payment_method,
          transaction_date: t.transaction_date,
          notes: t.notes,
          created_at: t.created_at
        })),
        count
      };
    },

    async get(id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(id, name, icon, type)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        categoryId: data.category_id,
        category: data.categories,
        amount: data.amount,
        transaction_type: data.transaction_type,
        payment_method: data.payment_method,
        transaction_date: data.transaction_date,
        notes: data.notes
      };
    },

    async update(id, transaction) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = { updated_at: new Date().toISOString() };
      if (transaction.amount !== undefined) updateData.amount = transaction.amount;
      if (transaction.categoryId) updateData.category_id = transaction.categoryId;
      if (transaction.type) updateData.transaction_type = transaction.type;
      if (transaction.paymentMethod !== undefined) updateData.payment_method = transaction.paymentMethod;
      if (transaction.date) updateData.transaction_date = transaction.date;
      if (transaction.notes !== undefined) updateData.notes = transaction.notes;

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    },

    async delete(id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    }
  },

  budgets: {
    async list(month = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { budgets: [] };

      let query = supabase
        .from('budgets')
        .select('*, categories(id, name, icon, type)')
        .eq('user_id', user.id);

      if (month) {
        query = query.eq('month', month);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        budgets: data.map(b => ({
          id: b.id,
          categoryId: b.category_id,
          category: b.categories,
          monthlyLimit: b.monthly_limit,
          month: b.month,
          createdAt: b.created_at
        }))
      };
    },

    async create(budget) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: budget.categoryId,
          monthly_limit: budget.monthlyLimit,
          month: budget.month
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        budget: {
          id: data.id,
          categoryId: data.category_id,
          monthlyLimit: data.monthly_limit,
          month: data.month
        }
      };
    },

    async update(id, budget) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = { updated_at: new Date().toISOString() };
      if (budget.monthlyLimit !== undefined) updateData.monthly_limit = budget.monthlyLimit;

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    },

    async delete(id) {
      const { data: { user} } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    }
  },

  reports: {
    async dashboard(month = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dateRange = month
        ? { start: `${month}-01`, end: `${month}-${new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()}` }
        : (() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
              start: start.toISOString().split('T')[0],
              end: end.toISOString().split('T')[0]
            };
          })();

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, categories(id, name, icon, type)')
        .eq('user_id', user.id)
        .gte('transaction_date', dateRange.start)
        .lte('transaction_date', dateRange.end)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      let totalIncome = 0;
      let totalExpenses = 0;
      const spendingByCategory = {};

      transactions.forEach(t => {
        if (t.transaction_type === 'income') {
          totalIncome += parseFloat(t.amount);
        } else {
          totalExpenses += parseFloat(t.amount);
        }

        const catId = t.category_id;
        if (!spendingByCategory[catId]) {
          spendingByCategory[catId] = {
            categoryId: catId,
            category: t.categories,
            amount: 0
          };
        }
        spendingByCategory[catId].amount += parseFloat(t.amount);
      });

      return {
        month: month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        totalIncome,
        totalExpenses,
        monthlyBalance: totalIncome - totalExpenses,
        recentTransactions: transactions.slice(0, 5),
        spendingByCategory: Object.values(spendingByCategory),
        transactionCount: transactions.length
      };
    },

    async monthly(year = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetYear = year || new Date().getFullYear();
      const monthlyData = [];

      for (let month = 1; month <= 12; month++) {
        const startDate = `${targetYear}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, month, 0).toISOString().split('T')[0];
        const monthStr = `${targetYear}-${String(month).padStart(2, '0')}`;

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount, transaction_type')
          .eq('user_id', user.id)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate);

        if (error) throw error;

        let income = 0;
        let expenses = 0;

        transactions.forEach(t => {
          if (t.transaction_type === 'income') {
            income += parseFloat(t.amount);
          } else {
            expenses += parseFloat(t.amount);
          }
        });

        monthlyData.push({
          month: monthStr,
          monthLabel: new Date(targetYear, month - 1).toLocaleDateString('en-US', { month: 'short' }),
          income,
          expenses,
          balance: income - expenses
        });
      }

      return { year: targetYear, data: monthlyData };
    },

    async yearly(startYear = null, endYear = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentYear = new Date().getFullYear();
      const start = startYear || currentYear - 1;
      const end = endYear || currentYear;
      const yearlyData = [];

      for (let year = start; year <= end; year++) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount, transaction_type')
          .eq('user_id', user.id)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate);

        if (error) throw error;

        let income = 0;
        let expenses = 0;

        transactions.forEach(t => {
          if (t.transaction_type === 'income') {
            income += parseFloat(t.amount);
          } else {
            expenses += parseFloat(t.amount);
          }
        });

        yearlyData.push({
          year,
          income,
          expenses,
          balance: income - expenses
        });
      }

      return { data: yearlyData };
    },

    async categoryTrends(categoryId, month = null) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const trends = [];
      const today = new Date(`${targetMonth}-01`);

      for (let i = 0; i < 12; i++) {
        const currentMonth = today.toISOString().slice(0, 7);
        const startDate = `${currentMonth}-01`;
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('category_id', categoryId)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate);

        if (error) throw error;

        let amount = 0;
        transactions.forEach(t => amount += parseFloat(t.amount));

        trends.push({
          month: currentMonth,
          monthLabel: today.toLocaleDateString('en-US', { month: 'short' }),
          amount
        });

        today.setMonth(today.getMonth() - 1);
      }

      return {
        categoryId,
        trends: trends.reverse()
      };
    }
  }
};

export default API;
