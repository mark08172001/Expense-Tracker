import Auth from '../lib/auth.js';
import API from '../lib/api.js';
import Utils from '../lib/utils.js';

Utils.loadDarkModePreference();

let categories = [];
let editingTransactionId = null;

(async () => {
  const isAuth = await Auth.init();
  if (!isAuth) {
    window.location.href = '/';
    return;
  }

  const user = Auth.getUser();
  if (user) {
    const profile = await API.auth.getProfile();
    document.getElementById('userEmail').textContent = profile.email;
  }

  initPage();
})();

const dateRange = Utils.getMonthDateRange();
document.getElementById('filterStartDate').value = dateRange.start;
document.getElementById('filterEndDate').value = dateRange.end;

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('addTransactionBtn').addEventListener('click', openAddModal);
document.getElementById('applyFiltersBtn').addEventListener('click', loadTransactions);
document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
document.getElementById('exportBtn').addEventListener('click', exportTransactions);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('transactionForm').addEventListener('submit', saveTransaction);

async function initPage() {
  try {
    const response = await API.categories.list();
    categories = response.categories || [];

    const filterCategorySelect = document.getElementById('filterCategory');
    const modalCategorySelect = document.getElementById('categoryId');

    categories.forEach(cat => {
      const option1 = document.createElement('option');
      option1.value = cat.id;
      option1.textContent = `${cat.icon} ${cat.name}`;
      filterCategorySelect.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = cat.id;
      option2.textContent = `${cat.icon} ${cat.name}`;
      modalCategorySelect.appendChild(option2);
    });

    await loadTransactions();
  } catch (error) {
    console.error('Error initializing:', error);
    Utils.showToast('Error loading data', 'error');
  }
}

async function loadTransactions() {
  try {
    const filters = {
      startDate: document.getElementById('filterStartDate').value,
      endDate: document.getElementById('filterEndDate').value,
      categoryId: document.getElementById('filterCategory').value || null,
      type: document.getElementById('filterType').value || null,
      limit: 100
    };

    const response = await API.transactions.list(filters);
    displayTransactions(response.transactions || []);
  } catch (error) {
    console.error('Error loading transactions:', error);
    Utils.showToast('Error loading transactions', 'error');
  }
}

function displayTransactions(transactions) {
  const container = document.getElementById('transactionsContainer');

  if (transactions.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No transactions found</p>';
    return;
  }

  let html = `<table class="table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Type</th><th>Method</th><th>Actions</th></tr></thead><tbody>`;

  transactions.forEach(trans => {
    const typeColor = trans.transaction_type === 'income' ? '#10b981' : '#ef4444';
    const symbol = trans.transaction_type === 'income' ? '+' : '-';

    html += `
      <tr>
        <td>${Utils.formatDate(trans.transaction_date, 'short')}</td>
        <td>${trans.category?.icon || '📌'} ${trans.category?.name || 'Unknown'}</td>
        <td>${Utils.escapeHtml(trans.notes || '-')}</td>
        <td style="color: ${typeColor}; font-weight: 600;">${symbol}${Utils.formatCurrency(trans.amount)}</td>
        <td>${Utils.getTypeBadge(trans.transaction_type)}</td>
        <td>${trans.payment_method || '-'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline" onclick="editTransaction('${trans.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTransaction('${trans.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function resetFilters() {
  const dateRange = Utils.getMonthDateRange();
  document.getElementById('filterStartDate').value = dateRange.start;
  document.getElementById('filterEndDate').value = dateRange.end;
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterType').value = '';
  loadTransactions();
}

window.editTransaction = async function(id) {
  try {
    const transaction = await API.transactions.get(id);
    editingTransactionId = id;

    document.getElementById('modalTitle').textContent = 'Edit Transaction';
    document.getElementById('submitBtn').textContent = 'Update Transaction';

    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.transaction_type;
    document.getElementById('categoryId').value = transaction.categoryId;
    document.getElementById('date').value = transaction.transaction_date;
    document.getElementById('paymentMethod').value = transaction.payment_method || '';
    document.getElementById('notes').value = transaction.notes || '';

    openModal();
  } catch (error) {
    Utils.showToast('Error loading transaction', 'error');
  }
};

window.deleteTransaction = async function(id) {
  const confirmed = await Utils.confirm('Are you sure you want to delete this transaction?');
  if (!confirmed) return;

  try {
    await API.transactions.delete(id);
    Utils.showToast('Transaction deleted', 'success');
    loadTransactions();
  } catch (error) {
    Utils.showToast('Error deleting transaction', 'error');
  }
};

function openAddModal() {
  editingTransactionId = null;
  document.getElementById('modalTitle').textContent = 'New Transaction';
  document.getElementById('submitBtn').textContent = 'Add Transaction';
  document.getElementById('transactionForm').reset();
  document.getElementById('date').valueAsDate = new Date();
  openModal();
}

function openModal() {
  document.getElementById('transactionModal').classList.add('show');
}

function closeModal() {
  document.getElementById('transactionModal').classList.remove('show');
  editingTransactionId = null;
}

async function saveTransaction(e) {
  e.preventDefault();

  const data = {
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    categoryId: document.getElementById('categoryId').value,
    date: document.getElementById('date').value,
    paymentMethod: document.getElementById('paymentMethod').value,
    notes: document.getElementById('notes').value
  };

  try {
    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    if (editingTransactionId) {
      await API.transactions.update(editingTransactionId, data);
      Utils.showToast('Transaction updated', 'success');
    } else {
      await API.transactions.create(data);
      Utils.showToast('Transaction created', 'success');
    }

    closeModal();
    loadTransactions();
  } catch (error) {
    Utils.showToast(error.message, 'error');
  } finally {
    const btn = document.getElementById('submitBtn');
    btn.textContent = editingTransactionId ? 'Update Transaction' : 'Add Transaction';
    btn.disabled = false;
  }
}

async function exportTransactions() {
  try {
    const filters = {
      startDate: document.getElementById('filterStartDate').value,
      endDate: document.getElementById('filterEndDate').value,
      limit: 1000
    };

    const response = await API.transactions.list(filters);
    const transactions = response.transactions || [];

    let csv = 'Date,Category,Amount,Type,Payment Method,Notes\n';
    transactions.forEach(trans => {
      csv += `${trans.transaction_date},"${trans.category?.name || 'Unknown'}",${trans.amount},${trans.transaction_type},"${trans.payment_method || ''}","${(trans.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Utils.showToast('Exported successfully', 'success');
  } catch (error) {
    Utils.showToast('Error exporting transactions', 'error');
  }
}
