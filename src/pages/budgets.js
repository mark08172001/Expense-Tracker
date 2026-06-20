import Auth from '../lib/auth.js';
import API from '../lib/api.js';
import Utils from '../lib/utils.js';

Utils.loadDarkModePreference();

let categories = [];
let editingBudgetId = null;

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

const monthInput = document.getElementById('monthSelector');
const today = new Date();
monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('addBudgetBtn').addEventListener('click', openAddModal);
document.getElementById('monthSelector').addEventListener('change', loadBudgets);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('budgetForm').addEventListener('submit', saveBudget);

async function initPage() {
  try {
    const response = await API.categories.list('expense');
    categories = response.categories || [];

    const modalCategorySelect = document.getElementById('budgetCategoryId');
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      modalCategorySelect.appendChild(option);
    });

    document.getElementById('budgetMonth').value = monthInput.value;

    await loadBudgets();
  } catch (error) {
    console.error('Error initializing:', error);
    Utils.showToast('Error loading data', 'error');
  }
}

async function loadBudgets() {
  try {
    const month = document.getElementById('monthSelector').value;
    document.getElementById('budgetMonth').value = month;

    const response = await API.budgets.list(month);

    const [year, monthNum] = month.split('-');
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
    const filterEndDate = `${year}-${monthNum}-${endDate.getDate()}`;

    const transResponse = await API.transactions.list({
      startDate: `${month}-01`,
      endDate: filterEndDate,
      limit: 1000
    });
    const transactions = transResponse.transactions || [];

    displayBudgets(response.budgets || [], transactions);
  } catch (error) {
    console.error('Error loading budgets:', error);
    Utils.showToast('Error loading budgets', 'error');
  }
}

function displayBudgets(budgets, transactions) {
  const container = document.getElementById('budgetsContainer');

  if (budgets.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem; grid-column: 1 / -1;">No budgets set for this month</p>';
    return;
  }

  let html = '';

  budgets.forEach(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const spent = transactions
      .filter(t => t.categoryId === budget.categoryId && t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const percentage = (spent / budget.monthlyLimit) * 100;
    const remaining = budget.monthlyLimit - spent;
    const isExceeded = spent > budget.monthlyLimit;

    let statusClass = 'success';
    let statusText = 'On track';

    if (percentage > 80) {
      statusClass = 'warning';
      statusText = 'Warning';
    }
    if (isExceeded) {
      statusClass = 'danger';
      statusText = 'Exceeded';
    }

    html += `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">${category?.icon} ${category?.name || 'Unknown'}</h3>
            <span class="badge badge-${statusClass}">${statusText}</span>
          </div>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline" onclick="editBudget('${budget.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteBudget('${budget.id}')">Delete</button>
          </div>
        </div>
        <div class="card-body">
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Budget Limit</span>
              <strong>${Utils.formatCurrency(budget.monthlyLimit)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Spent</span>
              <strong style="color: ${isExceeded ? '#ef4444' : '#6b7280'};">${Utils.formatCurrency(spent)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
              <span>Remaining</span>
              <strong style="color: ${isExceeded ? '#ef4444' : '#10b981'};">${Utils.formatCurrency(Math.max(0, remaining))}</strong>
            </div>
          </div>
          <div style="background: #e5e7eb; border-radius: 0.5rem; height: 8px; overflow: hidden;">
            <div style="background: ${isExceeded ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981'}; height: 100%; width: ${Math.min(100, percentage)}%; transition: width 0.3s ease;"></div>
          </div>
          <div style="text-align: center; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-light);">
            ${percentage.toFixed(0)}% used
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openAddModal() {
  editingBudgetId = null;
  document.getElementById('modalTitle').textContent = 'New Budget';
  document.getElementById('submitBtn').textContent = 'Create Budget';
  document.getElementById('budgetForm').reset();
  document.getElementById('budgetMonth').value = document.getElementById('monthSelector').value;
  openModal();
}

function openModal() {
  document.getElementById('budgetModal').classList.add('show');
}

function closeModal() {
  document.getElementById('budgetModal').classList.remove('show');
  editingBudgetId = null;
}

window.editBudget = async function(id) {
  try {
    const month = document.getElementById('monthSelector').value;
    const response = await API.budgets.list(month);
    const budget = response.budgets.find(b => b.id === id);

    if (!budget) {
      Utils.showToast('Budget not found', 'error');
      return;
    }

    editingBudgetId = id;
    document.getElementById('modalTitle').textContent = 'Edit Budget';
    document.getElementById('submitBtn').textContent = 'Update Budget';

    document.getElementById('budgetCategoryId').value = budget.categoryId;
    document.getElementById('budgetMonthlyLimit').value = budget.monthlyLimit;
    document.getElementById('budgetMonth').value = budget.month;

    openModal();
  } catch (error) {
    Utils.showToast('Error loading budget', 'error');
  }
};

window.deleteBudget = async function(id) {
  const confirmed = await Utils.confirm('Are you sure you want to delete this budget?');
  if (!confirmed) return;

  try {
    await API.budgets.delete(id);
    Utils.showToast('Budget deleted', 'success');
    loadBudgets();
  } catch (error) {
    Utils.showToast(error.message, 'error');
  }
};

async function saveBudget(e) {
  e.preventDefault();

  const data = {
    categoryId: document.getElementById('budgetCategoryId').value,
    monthlyLimit: parseFloat(document.getElementById('budgetMonthlyLimit').value),
    month: document.getElementById('budgetMonth').value
  };

  try {
    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    if (editingBudgetId) {
      await API.budgets.update(editingBudgetId, data);
      Utils.showToast('Budget updated', 'success');
    } else {
      await API.budgets.create(data);
      Utils.showToast('Budget created', 'success');
    }

    closeModal();
    loadBudgets();
  } catch (error) {
    Utils.showToast(error.message, 'error');
  } finally {
    const btn = document.getElementById('submitBtn');
    btn.textContent = editingBudgetId ? 'Update Budget' : 'Create Budget';
    btn.disabled = false;
  }
}
