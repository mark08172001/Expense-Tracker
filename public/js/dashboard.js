/**
 * Dashboard Page Module
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

let monthlyChart, categoryChart;

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());

// Load dashboard data
async function loadDashboardData() {
    try {
        const dateRange = Utils.getMonthDateRange(document.getElementById('monthSelector').value);
        const response = await API.reports.dashboard(dateRange.month);

        // Update stats
        document.getElementById('totalIncome').textContent = Utils.formatCurrency(response.totalIncome);
        document.getElementById('totalExpenses').textContent = Utils.formatCurrency(response.totalExpenses);
        document.getElementById('monthlyBalance').textContent = Utils.formatCurrency(response.monthlyBalance);

        // Update chart
        updateCategoryChart(response.spendingByCategory);

        // Update recent transactions
        displayRecentTransactions(response.recentTransactions);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        Utils.showToast('Error loading dashboard data', 'error');
    }
}

function updateCategoryChart(data) {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => item.category?.name || 'Unknown');
    const amounts = data.map(item => item.amount);
    const colors = Utils.generateChartColors(labels.length);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: window.getComputedStyle(document.body).backgroundColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
                        padding: 15
                    }
                }
            }
        }
    });
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactionsContainer');

    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No transactions yet</p>';
        return;
    }

    let html = '<table class="table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Type</th></tr></thead><tbody>';

    transactions.forEach(trans => {
        const icon = trans.category?.icon || '📌';
        const typeColor = trans.transaction_type === 'income' ? '#10b981' : '#ef4444';
        const symbol = trans.transaction_type === 'income' ? '+' : '-';

        html += `
            <tr>
                <td>${Utils.formatDate(trans.transaction_date, 'short')}</td>
                <td>${icon} ${trans.category?.name || 'Unknown'}</td>
                <td style="color: ${typeColor};">${symbol}${Utils.formatCurrency(trans.amount)}</td>
                <td>${Utils.getTypeBadge(trans.transaction_type)}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Set current month
const monthInput = document.getElementById('monthSelector');
const today = new Date();
monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// Event listeners
monthInput.addEventListener('change', loadDashboardData);
document.getElementById('refreshBtn').addEventListener('click', loadDashboardData);

// Initial load
loadDashboardData();
