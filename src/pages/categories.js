import Auth from '../lib/auth.js';
import API from '../lib/api.js';
import Utils from '../lib/utils.js';

Utils.loadDarkModePreference();

let editingCategoryId = null;

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

  loadCategories();
})();

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('addCategoryBtn').addEventListener('click', openAddModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('categoryForm').addEventListener('submit', saveCategory);

async function loadCategories() {
  try {
    const response = await API.categories.list();
    displayCategories(response.categories || []);
  } catch (error) {
    console.error('Error loading categories:', error);
    Utils.showToast('Error loading categories', 'error');
  }
}

function displayCategories(categories) {
  const container = document.getElementById('categoriesContainer');

  if (categories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem; grid-column: 1 / -1;">No categories yet. Create one to get started!</p>';
    return;
  }

  let html = '';

  categories.forEach(category => {
    html += `
      <div class="card">
        <div class="card-header">
          <div>
            <span style="font-size: 2rem;">${category.icon}</span>
            <h3 class="card-title">${Utils.escapeHtml(category.name)}</h3>
            <span class="badge badge-primary">${category.type}</span>
          </div>
          <div class="table-actions">
            <button class="btn btn-sm btn-outline" onclick="editCategory('${category.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">Delete</button>
          </div>
        </div>
        <div class="card-body">
          <small style="color: var(--text-light);">Created: ${Utils.formatDate(category.createdAt)}</small>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openAddModal() {
  editingCategoryId = null;
  document.getElementById('modalTitle').textContent = 'New Category';
  document.getElementById('submitBtn').textContent = 'Add Category';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryIcon').value = '📌';
  openModal();
}

function openModal() {
  document.getElementById('categoryModal').classList.add('show');
}

function closeModal() {
  document.getElementById('categoryModal').classList.remove('show');
  editingCategoryId = null;
}

window.editCategory = async function(id) {
  try {
    const response = await API.categories.list();
    const category = response.categories.find(c => c.id === id);

    if (!category) {
      Utils.showToast('Category not found', 'error');
      return;
    }

    editingCategoryId = id;
    document.getElementById('modalTitle').textContent = 'Edit Category';
    document.getElementById('submitBtn').textContent = 'Update Category';

    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryType').value = category.type;
    document.getElementById('categoryIcon').value = category.icon || '📌';

    openModal();
  } catch (error) {
    Utils.showToast('Error loading category', 'error');
  }
};

window.deleteCategory = async function(id) {
  const confirmed = await Utils.confirm('Are you sure you want to delete this category?');
  if (!confirmed) return;

  try {
    await API.categories.delete(id);
    Utils.showToast('Category deleted', 'success');
    loadCategories();
  } catch (error) {
    Utils.showToast(error.message, 'error');
  }
};

async function saveCategory(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById('categoryName').value,
    type: document.getElementById('categoryType').value,
    icon: document.getElementById('categoryIcon').value || '📌'
  };

  try {
    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;

    if (editingCategoryId) {
      await API.categories.update(editingCategoryId, data);
      Utils.showToast('Category updated', 'success');
    } else {
      await API.categories.create(data);
      Utils.showToast('Category created', 'success');
    }

    closeModal();
    loadCategories();
  } catch (error) {
    Utils.showToast(error.message, 'error');
  } finally {
    const btn = document.getElementById('submitBtn');
    btn.textContent = editingCategoryId ? 'Update Category' : 'Add Category';
    btn.disabled = false;
  }
}
