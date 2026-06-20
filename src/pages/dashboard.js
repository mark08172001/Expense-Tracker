import Auth from '../lib/auth.js';
import API from '../lib/api.js';
import Utils from '../lib/utils.js';

Utils.loadDarkModePreference();

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

  loadDashboardData();
})();

const monthInput = document.getElementById('monthSelector');
const today = new Date();
monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

let categoryChart = null;

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
monthInput.addEventListener('change', loadDashboardData);
document.getElementById('refreshBtn').addEventListener('click', loadDashboardData);

async function loadDashboardData() {
  try {
    const month = document.getElementById('monthSelector').value;
    const response = await API.reports.dashboard(month);

    document.getElementById('totalIncome').textContent = Utils.formatCurrency(response.totalIncome);
    document.getElementById('totalExpenses').textContent = Utils.formatCurrency(response.totalExpenses);
    document.getElementById('monthlyBalance').textContent = Utils.formatCurrency(response.monthlyBalance);

    updateCategoryChart(response.spendingByCategory);
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
    const icon = trans.categories?.icon || '📌';
    const typeColor = trans.transaction_type === 'income' ? '#10b981' : '#ef4444';
    const symbol = trans.transaction_type === 'income' ? '+' : '-';

    html += `
      <tr>
        <td>${Utils.formatDate(trans.transaction_date, 'short')}</td>
        <td>${icon} ${trans.categories?.name || 'Unknown'}</td>
        <td style="color: ${typeColor};">${symbol}${Utils.formatCurrency(trans.amount)}</td>
        <td>${Utils.getTypeBadge(trans.transaction_type)}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}
