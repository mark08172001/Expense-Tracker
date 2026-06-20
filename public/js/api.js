/**
 * API Module - Handles all API communications
 */

const API = {
    baseUrl: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    },

    /**
     * Make API request
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}/${endpoint}`;
        const options = {
            method,
            headers: this.headers,
            credentials: 'include' // Include cookies for sessions
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        register(email, password, fullName) {
            return API.request('auth.php?action=register', 'POST', {
                email,
                password,
                fullName
            });
        },

        login(email, password) {
            return API.request('auth.php?action=login', 'POST', {
                email,
                password
            });
        },

        logout() {
            return API.request('auth.php?action=logout', 'POST');
        },

        getProfile() {
            return API.request('auth.php?action=profile', 'GET');
        },

        updateProfile(fullName, password = null) {
            const data = { fullName };
            if (password) data.password = password;
            return API.request('auth.php?action=profile', 'PUT', data);
        },

        checkAuth() {
            return API.request('auth.php?action=check', 'GET');
        }
    },

    // Transaction endpoints
    transactions: {
        create(transaction) {
            return API.request('transactions.php?action=create', 'POST', transaction);
        },

        list(filters = {}) {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.type) params.append('type', filters.type);
            if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.offset) params.append('offset', filters.offset);

            return API.request(`transactions.php?action=list&${params.toString()}`, 'GET');
        },

        get(id) {
            return API.request(`transactions.php?action=get&id=${id}`, 'GET');
        },

        update(id, transaction) {
            return API.request(`transactions.php?action=update&id=${id}`, 'PATCH', transaction);
        },

        delete(id) {
            return API.request(`transactions.php?action=delete&id=${id}`, 'DELETE');
        }
    },

    // Category endpoints
    categories: {
        list(type = null) {
            const url = type ? `categories.php?action=list&type=${type}` : 'categories.php?action=list';
            return API.request(url, 'GET');
        },

        create(category) {
            return API.request('categories.php?action=create', 'POST', category);
        },

        update(id, category) {
            return API.request(`categories.php?action=update&id=${id}`, 'PATCH', category);
        },

        delete(id) {
            return API.request(`categories.php?action=delete&id=${id}`, 'DELETE');
        }
    },

    // Budget endpoints
    budgets: {
        list(month = null) {
            const url = month ? `budgets.php?action=list&month=${month}` : 'budgets.php?action=list';
            return API.request(url, 'GET');
        },

        create(budget) {
            return API.request('budgets.php?action=create', 'POST', budget);
        },

        update(id, budget) {
            return API.request(`budgets.php?action=update&id=${id}`, 'PATCH', budget);
        },

        delete(id) {
            return API.request(`budgets.php?action=delete&id=${id}`, 'DELETE');
        }
    },

    // Reports endpoints
    reports: {
        dashboard(month = null) {
            const url = month ? `reports.php?action=dashboard&month=${month}` : 'reports.php?action=dashboard';
            return API.request(url, 'GET');
        },

        monthly(year = null) {
            const url = year ? `reports.php?action=monthly&year=${year}` : 'reports.php?action=monthly';
            return API.request(url, 'GET');
        },

        yearly(startYear = null, endYear = null) {
            let url = 'reports.php?action=yearly';
            if (startYear) url += `&startYear=${startYear}`;
            if (endYear) url += `&endYear=${endYear}`;
            return API.request(url, 'GET');
        },

        categoryTrends(categoryId, month = null) {
            const url = month ? `reports.php?action=category-trends&categoryId=${categoryId}&month=${month}` : `reports.php?action=category-trends&categoryId=${categoryId}`;
            return API.request(url, 'GET');
        }
    }
};

export default API;
