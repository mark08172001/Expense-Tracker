/**
 * Reports Page Module
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

let monthlyChart, yearlyChart, categoryTrendChart;
let categories = [];

// Set current month
const monthInput = document.getElementById('monthSelector');
const today = new Date();
monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('monthSelector').addEventListener('change', () => {
    loadMonthlyReport();
    loadCategoryTrends();
});
document.getElementById('categorySelector').addEventListener('change', loadCategoryTrends);

// Load reports
async function initPage() {
    try {
        const response = await API.categories.list();
        categories = response.categories || [];

        // Populate category selector
        const selector = document.getElementById('categorySelector');
        const expenseCategories = categories.filter(c => c.type === 'expense');
        expenseCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            selector.appendChild(option);
        });

        if (expenseCategories.length > 0) {
            selector.value = expenseCategories[0].id;
        }

        await loadMonthlyReport();
        await loadYearlyReport();
        if (expenseCategories.length > 0) {
            await loadCategoryTrends();
        }
    } catch (error) {
        console.error('Error initializing:', error);
        Utils.showToast('Error loading reports', 'error');
    }
}

async function loadMonthlyReport() {
    try {
        const month = document.getElementById('monthSelector').value;
        const response = await API.reports.monthly(month.split('-')[0]);

        const currentMonth = month;
        const monthData = response.data.find(d => d.month === currentMonth);

        if (!monthData) return;

        // Create monthly chart
        const ctx = document.getElementById('monthlyChart')?.getContext('2d');
        if (!ctx) return;

        if (monthlyChart) monthlyChart.destroy();

        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses', 'Balance'],
                datasets: [{
                    label: 'Amount',
                    data: [monthData.income, monthData.expenses, monthData.balance],
                    backgroundColor: ['#10b981', '#ef4444', '#6366f1'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    },
                    y: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading monthly report:', error);
    }
}

async function loadYearlyReport() {
    try {
        const currentYear = new Date().getFullYear();
        const response = await API.reports.yearly(currentYear - 1, currentYear);

        const ctx = document.getElementById('yearlyChart')?.getContext('2d');
        if (!ctx) return;

        if (yearlyChart) yearlyChart.destroy();

        const years = response.data.map(d => d.year);
        const income = response.data.map(d => d.income);
        const expenses = response.data.map(d => d.expenses);

        yearlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Income',
                        data: income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        borderWidth: 2
                    },
                    {
                        label: 'Expenses',
                        data: expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    }
                }
            }
        });

        // Update yearly summary
        displayYearlySummary(response.data);
    } catch (error) {
        console.error('Error loading yearly report:', error);
    }
}

function displayYearlySummary(data) {
    const summary = document.getElementById('yearlySummary');

    let html = '<div style="display: grid; gap: 1rem;">';

    data.forEach(year => {
        html += `
            <div style="padding: 1rem; background: var(--light); border-radius: 0.5rem;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">${year.year}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.95rem;">
                    <div>
                        <div style="color: var(--text-light);">Income</div>
                        <div style="color: #10b981; font-weight: 600;">${Utils.formatCurrency(year.income)}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-light);">Expenses</div>
                        <div style="color: #ef4444; font-weight: 600;">${Utils.formatCurrency(year.expenses)}</div>
                    </div>
                </div>
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                    <div style="color: var(--text-light);">Balance</div>
                    <div style="color: ${year.balance >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">${Utils.formatCurrency(year.balance)}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    summary.innerHTML = html;
}

async function loadCategoryTrends() {
    try {
        const categoryId = document.getElementById('categorySelector').value;
        if (!categoryId) return;

        const month = document.getElementById('monthSelector').value;
        const response = await API.reports.categoryTrends(categoryId, month);

        const ctx = document.getElementById('categoryTrendChart')?.getContext('2d');
        if (!ctx) return;

        if (categoryTrendChart) categoryTrendChart.destroy();

        const labels = response.trends.map(d => d.monthLabel);
        const amounts = response.trends.map(d => d.amount);

        categoryTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data: amounts,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading category trends:', error);
    }
}

// Initialize page
initPage();
