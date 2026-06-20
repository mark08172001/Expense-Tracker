/**
 * Categories Page Module
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

let editingCategoryId = null;
let defaultCategories = [];

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
document.getElementById('darkModeToggle').addEventListener('click', () => Utils.toggleDarkMode());
document.getElementById('addCategoryBtn').addEventListener('click', openAddModal);

// Modal controls
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('categoryForm').addEventListener('submit', saveCategory);

// Load categories
async function loadCategories() {
    try {
        const response = await API.categories.list();
        defaultCategories = response.defaults || [];
        const userCategories = response.categories || [];
        displayCategories(userCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        Utils.showToast('Error loading categories', 'error');
    }
}

function displayCategories(categories) {
    const container = document.getElementById('categoriesContainer');

    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem; grid-column: 1 / -1;">No custom categories yet. Create one to get started!</p>';
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
                        <button class="btn btn-sm btn-outline" onclick="editCategory(${category.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                    </div>
                </div>
                <div class="card-body">
                    <small style="color: var(--text-light);">Created: ${Utils.formatDate(category.created_at)}</small>
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

async function editCategory(id) {
    try {
        const categories = (await API.categories.list()).categories;
        const category = categories.find(c => c.id === id);

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
}

async function deleteCategory(id) {
    const confirmed = await Utils.confirm('Are you sure? Transactions using this category cannot be deleted with this category.');
    if (!confirmed) return;

    try {
        await API.categories.delete(id);
        Utils.showToast('Category deleted', 'success');
        loadCategories();
    } catch (error) {
        Utils.showToast(error.message, 'error');
    }
}

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
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Make functions global for inline onclick
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// Initialize page
loadCategories();
