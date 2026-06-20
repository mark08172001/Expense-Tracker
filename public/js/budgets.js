/**
 * Budgets Page Module
 */

import Auth from './auth.js';
import API from './api.js';
import Utils from './utils.js';

// Initialize
Auth.init().then(() => Auth.requireAuth());
Utils.loadDarkModePreference();

// Set user email
Auth.init().then(() => {
    if (Auth.user) {
        document.getElementById('userEmail').textContent = Auth.user.email;
    }
});

let categories = [];
let editingBudgetId = null;

// Set current month
const monthInput = document.getElementById('monthSelector');
const today = new Date();
monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('addBudgetBtn').addEventListener('click', openAddModal);
document.getElementById('monthSelector').addEventListener('change', loadBudgets);

// Modal controls
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('budgetForm').addEventListener('submit', saveBudget);

// Initialize
async function initPage() {
    try {
        const response = await API.categories.list('expense');
        categories = response.categories || [];

        // Populate budget modal category select
        const modalCategorySelect = document.getElementById('budgetCategoryId');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            modalCategorySelect.appendChild(option);
        });

        // Set budget month to current month
        document.getElementById('budgetMonth').value = monthInput.value;

        await loadBudgets();
    } catch (error) {
        console.error('Error initializing:', error);
        Utils.showToast('Error loading categories', 'error');
    }
}

async function loadBudgets() {
    try {
        const month = document.getElementById('monthSelector').value;
        document.getElementById('budgetMonth').value = month;
        const response = await API.budgets.list(month);

        // Get spending for each category
        const filter = {
            startDate: month + '-01',
            endDate: new Date(month + '-01').toISOString().split('T')[0],
            limit: 1000
        };

        // Calculate correct end date
        const [year, monthNum] = month.split('-');
        const endDate = new Date(year, monthNum, 0);
        filter.endDate = `${year}-${monthNum}-${endDate.getDate()}`;

        const transResponse = await API.transactions.list(filter);
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
        const category = categories.find(c => c.id === budget.category_id);
        const spent = transactions
            .filter(t => t.category_id === budget.category_id && t.transaction_type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budget.monthly_limit) * 100;
        const remaining = budget.monthly_limit - spent;
        const isExceeded = spent > budget.monthly_limit;

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
                        <button class="btn btn-sm btn-outline" onclick="editBudget(${budget.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budget.id})">Delete</button>
                    </div>
                </div>
                <div class="card-body">
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Budget Limit</span>
                            <strong>${Utils.formatCurrency(budget.monthly_limit)}</strong>
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

async function editBudget(id) {
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

        document.getElementById('budgetCategoryId').value = budget.category_id;
        document.getElementById('budgetMonthlyLimit').value = budget.monthly_limit;
        document.getElementById('budgetMonth').value = budget.month;

        openModal();
    } catch (error) {
        Utils.showToast('Error loading budget', 'error');
    }
}

async function deleteBudget(id) {
    const confirmed = await Utils.confirm('Are you sure you want to delete this budget?');
    if (!confirmed) return;

    try {
        await API.budgets.delete(id);
        Utils.showToast('Budget deleted', 'success');
        loadBudgets();
    } catch (error) {
        Utils.showToast('Error deleting budget', 'error');
    }
}

async function saveBudget(e) {
    e.preventDefault();

    const data = {
        categoryId: parseInt(document.getElementById('budgetCategoryId').value),
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
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Make functions global for inline onclick
window.editBudget = editBudget;
window.deleteBudget = deleteBudget;

// Initialize page
initPage();
