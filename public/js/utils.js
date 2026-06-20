/**
 * Utility Module - Common helper functions
 */

const Utils = {
    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format date
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        if (format === 'short') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },

    /**
     * Format date for input
     */
    formatDateForInput(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    /**
     * Get date range for month
     */
    getMonthDateRange(month = null) {
        const now = month ? new Date(month + '-01') : new Date();
        const year = now.getFullYear();
        const monthNum = now.getMonth();

        const startDate = new Date(year, monthNum, 1);
        const endDate = new Date(year, monthNum + 1, 0);

        return {
            start: this.formatDateForInput(startDate),
            end: this.formatDateForInput(endDate),
            month: `${year}-${String(monthNum + 1).padStart(2, '0')}`
        };
    },

    /**
     * Parse amount to float
     */
    parseAmount(amount) {
        const parsed = parseFloat(amount);
        return isNaN(parsed) ? 0 : parsed;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    },

    /**
     * Show confirmation dialog
     */
    confirm(message) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Confirm</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${this.escapeHtml(message)}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline cancel-btn">Cancel</button>
                        <button class="btn btn-danger confirm-btn">Confirm</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            modal.querySelector('.cancel-btn').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            modal.querySelector('.confirm-btn').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
        });
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    },

    /**
     * Load dark mode preference
     */
    loadDarkModePreference() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    },

    /**
     * Debounce function
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Get transaction type color
     */
    getTypeColor(type) {
        return type === 'income' ? '#10b981' : '#ef4444';
    },

    /**
     * Get transaction type badge
     */
    getTypeBadge(type) {
        return `<span class="badge badge-${type}">${type.toUpperCase()}</span>`;
    },

    /**
     * Calculate percentage
     */
    calculatePercentage(value, total) {
        return total === 0 ? 0 : ((value / total) * 100).toFixed(2);
    },

    /**
     * Generate color for chart
     */
    generateChartColors(count) {
        const colors = [
            '#6366f1',
            '#ec4899',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16'
        ];

        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    },

    /**
     * Clone object
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

export default Utils;
