const Utils = {
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },

  formatDateForInput(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

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

  parseAmount(amount) {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  },

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  },

  showToast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  },

  async confirm(message) {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'modal show';
      modal.style.display = 'flex';
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

      const close = (result) => {
        modal.remove();
        resolve(result);
      };

      modal.querySelector('.modal-close').addEventListener('click', () => close(false));
      modal.querySelector('.cancel-btn').addEventListener('click', () => close(false));
      modal.querySelector('.confirm-btn').addEventListener('click', () => close(true));
    });
  },

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  },

  loadDarkModePreference() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  },

  getTypeColor(type) {
    return type === 'income' ? '#10b981' : '#ef4444';
  },

  getTypeBadge(type) {
    return `<span class="badge badge-${type}">${type.toUpperCase()}</span>`;
  },

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
  }
};

export default Utils;
