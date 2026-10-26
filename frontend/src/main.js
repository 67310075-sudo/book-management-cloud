import './style.css';
import { api, storage, API_BASE_URL } from './api.js';

// Application State
let state = {
  user: null,
  books: [],
  filteredBooks: [],
  searchQuery: '',
  selectedCategory: '',
  sortOrder: 'id-desc',
  editingBookId: null,
  deletingBookId: null,
};

// DOM Elements
const apiStatusPill = document.getElementById('apiStatusPill');
const activeApiUrl = document.getElementById('activeApiUrl');
const userNavSection = document.getElementById('userNavSection');
const currentRoleIndicator = document.getElementById('currentRoleIndicator');

const dashboardSection = document.getElementById('dashboardSection');
const authSection = document.getElementById('authSection');

const statTotalBooks = document.getElementById('statTotalBooks');
const statTotalValue = document.getElementById('statTotalValue');
const statTotalCategories = document.getElementById('statTotalCategories');
const statActiveRole = document.getElementById('statActiveRole');

const roleAlertBanner = document.getElementById('roleAlertBanner');
const roleAlertText = document.getElementById('roleAlertText');

const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelector = document.getElementById('sortSelector');
const btnRefresh = document.getElementById('btnRefresh');
const btnOpenAddModal = document.getElementById('btnOpenAddModal');

const booksTable = document.getElementById('booksTable');
const booksTableBody = document.getElementById('booksTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');
const modalTitle = document.getElementById('modalTitle');
const bookIdInput = document.getElementById('bookId');
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const bookPriceInput = document.getElementById('bookPrice');
const bookStockInput = document.getElementById('bookStock');
const bookCategoryInput = document.getElementById('bookCategory');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');

const deleteModal = document.getElementById('deleteModal');
const deleteMessage = document.getElementById('deleteMessage');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCancelDelete = document.getElementById('btnCancelDelete');

const toastContainer = document.getElementById('toastContainer');

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Update active API URL display and ping status
 */
async function checkApiHealth() {
  activeApiUrl.textContent = API_BASE_URL;
  activeApiUrl.title = API_BASE_URL;

  const isUp = await api.ping();
  const statusDot = apiStatusPill.querySelector('.status-dot');
  if (isUp) {
    statusDot.style.backgroundColor = 'var(--accent-success)';
    statusDot.style.boxShadow = '0 0 8px var(--accent-success)';
  } else {
    statusDot.style.backgroundColor = 'var(--accent-warning)';
    statusDot.style.boxShadow = '0 0 8px var(--accent-warning)';
  }
}

/**
 * Synchronize Role-Based UI elements
 */
function updateRoleUI() {
  const user = state.user;
  const role = (user && user.role) ? user.role.toLowerCase() : 'guest';

  // Highlight active role quick button
  document.querySelectorAll('.btn-role-quick').forEach((btn) => {
    const btnEmail = btn.getAttribute('data-email');
    if (user && user.email === btnEmail) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (!user) {
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    userNavSection.innerHTML = '';
    currentRoleIndicator.innerHTML = '<span class="role-pill pill-guest">Guest (Unauthenticated)</span>';
    return;
  }

  // User is authenticated -> show dashboard
  dashboardSection.classList.remove('hidden');
  authSection.classList.add('hidden');

  // Update Navigation User Badge
  const roleTagClass = `tag-${role}`;
  const avatarClass = `avatar-${role}`;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  userNavSection.innerHTML = `
    <div class="user-profile-badge">
      <div class="user-avatar-mini ${avatarClass}">${initial}</div>
      <div class="user-profile-meta">
        <span class="u-name">${user.name || user.email}</span>
        <span class="u-role ${roleTagClass}">${role.toUpperCase()}</span>
      </div>
    </div>
    <button id="btnLogout" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
      Logout
    </button>
  `;

  document.getElementById('btnLogout').addEventListener('click', () => {
    storage.clearAll();
    state.user = null;
    state.books = [];
    updateRoleUI();
    showToast('Logged out successfully', 'info');
  });

  // Current Role Indicator in Quick Switcher
  currentRoleIndicator.innerHTML = `
    <span class="role-tag ${roleTagClass}" style="font-size: 0.85rem; padding: 0.3rem 0.75rem;">
      Active: ${user.name} (${role.toUpperCase()})
    </span>
  `;

  // Stats Card
  statActiveRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);

  // Role Permissions Rules (Lab 9.5 & 9.6)
  if (role === 'viewer') {
    btnOpenAddModal.classList.add('hidden');
    roleAlertBanner.className = 'role-banner banner-viewer';
    roleAlertText.textContent = `👁️ Viewer Role (${user.email}): Read-only mode. "Add Book", "Edit", and "Delete" are restricted.`;
  } else if (role === 'editor') {
    btnOpenAddModal.classList.remove('hidden');
    roleAlertBanner.className = 'role-banner banner-editor';
    roleAlertText.textContent = `✏️ Editor Role (${user.email}): You can create and edit books. "Delete" is restricted to Admins.`;
  } else if (role === 'manager') {
    btnOpenAddModal.classList.remove('hidden');
    roleAlertBanner.className = 'role-banner banner-manager';
    roleAlertText.textContent = `👑 Manager Role (${user.email}): Full management access. Deletion is restricted to Admins.`;
  } else if (role === 'admin') {
    btnOpenAddModal.classList.remove('hidden');
    roleAlertBanner.className = 'role-banner banner-admin';
    roleAlertText.textContent = `🛡️ Admin Role (${user.email}): Full administrative privileges enabled. You can Add, Edit, and Delete books.`;
  }

  renderBooksTable();
}

/**
 * Fetch books from API and update local state
 */
async function loadBooks() {
  if (!state.user) return;

  try {
    const data = await api.getBooks();
    state.books = Array.isArray(data) ? data : (data.results || []);
    applyFilters();
    updateStatistics();
    populateCategoryFilter();
  } catch (err) {
    if (err.status === 401) {
      showToast('Session expired or unauthorized (401). Please log in.', 'error');
      storage.clearAll();
      state.user = null;
      updateRoleUI();
    } else {
      showToast(`Failed to load books: ${err.message}`, 'error');
    }
  }
}

/**
 * Filter and sort books based on current controls
 */
function applyFilters() {
  let list = [...state.books];

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(b =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (state.selectedCategory) {
    list = list.filter(b => b.category === state.selectedCategory);
  }

  // Sort
  list.sort((a, b) => {
    switch (state.sortOrder) {
      case 'id-desc': return b.id - a.id;
      case 'id-asc': return a.id - b.id;
      case 'price-asc': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'title-asc': return (a.title || '').localeCompare(b.title || '');
      default: return b.id - a.id;
    }
  });

  state.filteredBooks = list;
  renderBooksTable();
}

/**
 * Update summary stats cards
 */
function updateStatistics() {
  statTotalBooks.textContent = state.books.length;

  const totalValue = state.books.reduce((sum, b) => {
    const p = parseFloat(b.price) || 0;
    const s = parseInt(b.stock) || 0;
    return sum + (p * s);
  }, 0);
  statTotalValue.textContent = `${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿`;

  const uniqueCats = new Set(state.books.map(b => b.category).filter(Boolean));
  statTotalCategories.textContent = uniqueCats.size;
}

/**
 * Populate Category dropdown from books
 */
function populateCategoryFilter() {
  const current = categoryFilter.value;
  const categories = Array.from(new Set(state.books.map(b => b.category).filter(Boolean))).sort();

  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    categoryFilter.appendChild(opt);
  });
}

/**
 * Render Books Table with RBAC rules
 */
function renderBooksTable() {
  const user = state.user;
  const role = (user && user.role) ? user.role.toLowerCase() : 'viewer';

  booksTableBody.innerHTML = '';

  if (state.filteredBooks.length === 0) {
    booksTable.classList.add('hidden');
    tableEmptyState.classList.remove('hidden');
    return;
  }

  booksTable.classList.remove('hidden');
  tableEmptyState.classList.add('hidden');

  state.filteredBooks.forEach(book => {
    const tr = document.createElement('tr');

    const stock = parseInt(book.stock) || 0;
    let stockBadgeClass = 'stock-in';
    let stockText = `${stock} in stock`;
    if (stock <= 0) {
      stockBadgeClass = 'stock-out';
      stockText = 'Out of Stock';
    } else if (stock <= 5) {
      stockBadgeClass = 'stock-low';
      stockText = `${stock} left (Low)`;
    }

    const price = parseFloat(book.price) || 0;

    let actionButtonsHtml = '';
    if (role === 'admin') {
      actionButtonsHtml = `
        <button class="btn-table-action btn-table-edit" data-id="${book.id}">✏️ Edit</button>
        <button class="btn-table-action btn-table-delete" data-id="${book.id}">🗑️ Delete</button>
      `;
    } else if (role === 'editor' || role === 'manager') {
      actionButtonsHtml = `
        <button class="btn-table-action btn-table-edit" data-id="${book.id}">✏️ Edit</button>
      `;
    } else {
      actionButtonsHtml = `
        <span style="font-size: 0.75rem; color: var(--text-dim);">Read-Only</span>
      `;
    }

    tr.innerHTML = `
      <td style="color: var(--text-dim); font-weight: 600;">#${book.id}</td>
      <td>
        <div class="book-title-cell">
          <span class="b-title">${escapeHtml(book.title)}</span>
          <span class="b-author">by ${escapeHtml(book.author || 'Unknown')}</span>
        </div>
      </td>
      <td>
        <span class="category-badge">${escapeHtml(book.category || 'General')}</span>
      </td>
      <td style="text-align: right; font-weight: 700; color: #38bdf8;">
        ${price.toFixed(2)} ฿
      </td>
      <td style="text-align: center;">
        <span class="stock-badge ${stockBadgeClass}">${stockText}</span>
      </td>
      <td style="text-align: center;">
        <div class="table-actions-cell">
          ${actionButtonsHtml}
        </div>
      </td>
    `;

    booksTableBody.appendChild(tr);
  });

  // Attach event handlers to action buttons
  document.querySelectorAll('.btn-table-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditModal(id);
    });
  });

  document.querySelectorAll('.btn-table-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openDeleteModal(id);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Modal Handling
 */
function openAddModal() {
  state.editingBookId = null;
  modalTitle.textContent = 'Add New Book';
  bookForm.reset();
  bookIdInput.value = '';
  bookModal.classList.remove('hidden');
}

function openEditModal(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;

  state.editingBookId = id;
  modalTitle.textContent = `Edit Book #${id}`;
  bookIdInput.value = book.id;
  bookTitleInput.value = book.title || '';
  bookAuthorInput.value = book.author || '';
  bookPriceInput.value = book.price || '';
  bookStockInput.value = book.stock || 0;
  bookCategoryInput.value = book.category || '';

  bookModal.classList.remove('hidden');
}

function closeBookModal() {
  bookModal.classList.add('hidden');
  state.editingBookId = null;
}

function openDeleteModal(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;

  state.deletingBookId = id;
  deleteMessage.textContent = `Are you sure you want to permanently delete "${book.title}" (#${book.id})?`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  state.deletingBookId = null;
}

/**
 * Quick Login Action
 */
async function handleQuickLogin(email) {
  try {
    showToast(`Authenticating as ${email}...`, 'info');
    const res = await api.login(email, '123456');
    state.user = res.user;
    updateRoleUI();
    await loadBooks();
    showToast(`Welcome ${res.user.name}! (Role: ${res.user.role.toUpperCase()})`, 'success');
  } catch (err) {
    showToast(`Quick login failed: ${err.message}`, 'error');
  }
}

// Global helper for preset buttons in Auth Card
window.fillLogin = (email, password) => {
  loginEmail.value = email;
  loginPassword.value = password;
  loginForm.dispatchEvent(new Event('submit'));
};

/**
 * Event Listeners Initialization
 */
function initEvents() {
  document.getElementById('btnQuickUserA').addEventListener('click', () => handleQuickLogin('usera@test.com'));
  document.getElementById('btnQuickUserB').addEventListener('click', () => handleQuickLogin('userb@test.com'));
  document.getElementById('btnQuickUserC').addEventListener('click', () => handleQuickLogin('userc@test.com'));
  document.getElementById('btnQuickManager').addEventListener('click', () => handleQuickLogin('manager@test.com'));

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
      showToast('Signing in...', 'info');
      const res = await api.login(email, password);
      state.user = res.user;
      updateRoleUI();
      await loadBooks();
      showToast(`Login successful as ${res.user.role.toUpperCase()}`, 'success');
    } catch (err) {
      showToast(`Login failed: ${err.message}`, 'error');
    }
  });

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    applyFilters();
  });

  categoryFilter.addEventListener('change', (e) => {
    state.selectedCategory = e.target.value;
    applyFilters();
  });

  sortSelector.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    applyFilters();
  });

  btnRefresh.addEventListener('click', () => {
    loadBooks();
    showToast('Inventory refreshed', 'info');
  });

  btnOpenAddModal.addEventListener('click', openAddModal);
  btnCloseModal.addEventListener('click', closeBookModal);
  btnCancelModal.addEventListener('click', closeBookModal);

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookPayload = {
      title: bookTitleInput.value.trim(),
      author: bookAuthorInput.value.trim(),
      price: parseFloat(bookPriceInput.value),
      stock: parseInt(bookStockInput.value),
      category: bookCategoryInput.value.trim()
    };

    try {
      if (state.editingBookId) {
        await api.updateBook(state.editingBookId, bookPayload);
        showToast('Book updated successfully!', 'success');
      } else {
        await api.createBook(bookPayload);
        showToast('New book created successfully!', 'success');
      }
      closeBookModal();
      await loadBooks();
    } catch (err) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  });

  btnCancelDelete.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', async () => {
    if (!state.deletingBookId) return;
    const bookId = state.deletingBookId;

    try {
      const res = await api.deleteBook(bookId);
      closeDeleteModal();
      if (res.status === 204 || res.status === 200) {
        showToast(`Book #${bookId} deleted successfully (204 No Content)`, 'success');
      }
      await loadBooks();
    } catch (err) {
      closeDeleteModal();
      if (err.status === 403) {
        showToast(`403 Forbidden: Your role (${state.user ? state.user.role : 'none'}) is not permitted to delete books.`, 'error');
      } else {
        showToast(`Delete failed: ${err.message}`, 'error');
      }
    }
  });
}

async function initApp() {
  initEvents();
  await checkApiHealth();

  const storedUser = storage.getUser();
  const storedToken = storage.getToken();

  if (storedUser && storedToken) {
    state.user = storedUser;
    updateRoleUI();
    await loadBooks();
  } else {
    await handleQuickLogin('usera@test.com');
  }
}

initApp();
