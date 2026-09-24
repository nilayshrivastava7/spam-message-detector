/* ==========================================================================
   ApexExpense - Main JavaScript Application Logic
   ========================================================================== */

// --- CATEGORY CONFIGURATION ---
const CATEGORIES = {
    // Expense Categories
    housing: { name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#6366f1' },
    food: { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#f59e0b' },
    transport: { name: 'Transportation', type: 'expense', icon: 'car', color: '#06b6d4' },
    utilities: { name: 'Bills & Utilities', type: 'expense', icon: 'zap', color: '#10b981' },
    entertainment: { name: 'Entertainment', type: 'expense', icon: 'tv', color: '#ec4899' },
    shopping: { name: 'Shopping & Gear', type: 'expense', icon: 'shopping-bag', color: '#8b5cf6' },
    healthcare: { name: 'Healthcare & Fitness', type: 'expense', icon: 'heart-pulse', color: '#ef4444' },
    education: { name: 'Education & Courses', type: 'expense', icon: 'book-open', color: '#3b82f6' },
    misc: { name: 'Miscellaneous', type: 'expense', icon: 'more-horizontal', color: '#6b7280' },
    
    // Income Categories
    salary: { name: 'Salary & Wages', type: 'income', icon: 'briefcase', color: '#10b981' },
    freelance: { name: 'Freelance & Side Business', type: 'income', icon: 'laptop', color: '#06b6d4' },
    investments: { name: 'Investments & Crypto', type: 'income', icon: 'trending-up', color: '#8b5cf6' },
    gifts: { name: 'Gifts & Refunds', type: 'income', icon: 'gift', color: '#ec4899' }
};

const CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$'
};

// --- DEFAULT SAMPLE DATA ---
const SAMPLE_TRANSACTIONS = [
    { id: 't1', title: 'Monthly Salary Deposit', amount: 5200.00, type: 'income', category: 'salary', date: '2026-08-01', payment: 'Bank Transfer', tags: ['primary', 'job'], note: 'Direct deposit salary' },
    { id: 't2', title: 'Apartment Rent', amount: 1650.00, type: 'expense', category: 'housing', date: '2026-08-02', payment: 'Bank Transfer', tags: ['fixed', 'essential'], note: 'August rent' },
    { id: 't3', title: 'Whole Foods Grocery', amount: 184.50, type: 'expense', category: 'food', date: '2026-08-03', payment: 'Credit Card', tags: ['groceries'], note: 'Weekly produce & essentials' },
    { id: 't4', title: 'Freelance Web Design', amount: 950.00, type: 'income', category: 'freelance', date: '2026-08-04', payment: 'Digital Wallet', tags: ['client', 'side-hustle'], note: 'Landing page client project' },
    { id: 't5', title: 'Electric & Hydro Bill', amount: 112.30, type: 'expense', category: 'utilities', date: '2026-08-05', payment: 'Debit Card', tags: ['utilities'], note: 'Energy bill' },
    { id: 't6', title: 'Uber & Subway Commute', amount: 45.00, type: 'expense', category: 'transport', date: '2026-08-06', payment: 'Credit Card', tags: ['transit'], note: 'Work commute' },
    { id: 't7', title: 'Dinner with Team', amount: 88.00, type: 'expense', category: 'food', date: '2026-08-07', payment: 'Credit Card', tags: ['dining'], note: 'Italian bistro' },
    { id: 't8', title: 'Gym Membership', amount: 65.00, type: 'expense', category: 'healthcare', date: '2026-08-08', payment: 'Credit Card', tags: ['fitness'], note: 'Monthly auto-renew' },
    { id: 't9', title: 'Tech Gadget Purchase', amount: 249.99, type: 'expense', category: 'shopping', date: '2026-08-09', payment: 'Credit Card', tags: ['electronics'], note: 'Wireless noise-canceling headphones' },
    { id: 't10', title: 'Stock Dividend Payment', amount: 142.20, type: 'income', category: 'investments', date: '2026-08-10', payment: 'Bank Transfer', tags: ['passive'], note: 'Quarterly ETF payout' }
];

const SAMPLE_BUDGETS = {
    food: 500,
    housing: 1700,
    transport: 250,
    shopping: 350,
    entertainment: 200,
    utilities: 200,
    healthcare: 150
};

const SAMPLE_GOALS = [
    { id: 'g1', title: 'Emergency Reserve Fund', target: 5000, current: 3400 },
    { id: 'g2', title: 'Japan Summer Vacation', target: 3500, current: 1850 },
    { id: 'g3', title: 'New M4 MacBook Pro', target: 2200, current: 1100 }
];

// --- APP STATE ---
let state = {
    transactions: [],
    budgets: {},
    goals: [],
    currency: 'USD',
    theme: 'dark',
    activeTab: 'dashboard',
    editingTransactionId: null
};

// --- CHART INSTANCES ---
let trendChartInstance = null;
let categoryChartInstance = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    initTheme();
    initCurrency();
    initEventListeners();
    populateCategoryDropdowns();
    renderAll();
    
    // Lucide icon replace
    if (window.lucide) {
        lucide.createIcons();
    }
});

// --- STORAGE MANAGEMENT ---
function loadStateFromStorage() {
    const saved = localStorage.getItem('apex_expense_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.transactions = parsed.transactions || [];
            state.budgets = parsed.budgets || SAMPLE_BUDGETS;
            state.goals = parsed.goals || SAMPLE_GOALS;
            state.currency = parsed.currency || 'USD';
            state.theme = parsed.theme || 'dark';
        } catch (e) {
            console.error('Failed to parse local data', e);
            loadDefaultData();
        }
    } else {
        loadDefaultData();
    }
}

function loadDefaultData() {
    state.transactions = [...SAMPLE_TRANSACTIONS];
    state.budgets = { ...SAMPLE_BUDGETS };
    state.goals = [...SAMPLE_GOALS];
    state.currency = 'USD';
    state.theme = 'dark';
    saveStateToStorage();
}

function saveStateToStorage() {
    localStorage.setItem('apex_expense_data', JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        currency: state.currency,
        theme: state.theme
    }));
}

// --- THEME & CURRENCY ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeText = document.querySelector('.theme-text');
    if (themeText) {
        themeText.textContent = state.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    initTheme();
    saveStateToStorage();
    renderCharts(); // Redraw charts with adapted themes
    showToast(`Switched to ${state.theme} mode`, 'info');
}

function initCurrency() {
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        currencySelect.value = state.currency;
    }
    updateCurrencySymbols();
}

function updateCurrencySymbols() {
    const sym = CURRENCY_SYMBOLS[state.currency] || '$';
    const modalSymbol = document.getElementById('modalCurrencySymbol');
    const budgetSymbol = document.getElementById('budgetModalCurrencySymbol');
    if (modalSymbol) modalSymbol.textContent = sym;
    if (budgetSymbol) budgetSymbol.textContent = sym;
}

function formatCurrency(amount) {
    const sym = CURRENCY_SYMBOLS[state.currency] || '$';
    return `${sym}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- POPULATE DROPDOWNS ---
function populateCategoryDropdowns() {
    const transCategory = document.getElementById('transCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    const budgetCategory = document.getElementById('budgetCategory');

    if (!transCategory) return;

    transCategory.innerHTML = '';
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    budgetCategory.innerHTML = '';

    Object.keys(CATEGORIES).forEach(key => {
        const cat = CATEGORIES[key];
        
        // Transaction Form Modal Dropdown
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${cat.type === 'income' ? '[Income]' : '[Expense]'} ${cat.name}`;
        transCategory.appendChild(option);

        // Filter Dropdown
        const filterOpt = document.createElement('option');
        filterOpt.value = key;
        filterOpt.textContent = cat.name;
        categoryFilter.appendChild(filterOpt);

        // Budget Category Dropdown (Expenses Only)
        if (cat.type === 'expense') {
            const budgetOpt = document.createElement('option');
            budgetOpt.value = key;
            budgetOpt.textContent = cat.name;
            budgetCategory.appendChild(budgetOpt);
        }
    });
}

// --- EVENT LISTENERS ---
function initEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Theme Toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

    // Currency Selector Change
    document.getElementById('currencySelect')?.addEventListener('change', (e) => {
        state.currency = e.target.value;
        saveStateToStorage();
        updateCurrencySymbols();
        renderAll();
        showToast(`Currency changed to ${state.currency}`, 'info');
    });

    // Quick Add Transaction Modal Trigger
    document.getElementById('openAddTransactionBtn')?.addEventListener('click', () => openTransactionModal());
    document.getElementById('closeModalBtn')?.addEventListener('click', closeTransactionModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeTransactionModal);

    // Transaction Form Submission
    document.getElementById('transactionForm')?.addEventListener('submit', handleTransactionFormSubmit);

    // View All Transactions Button
    document.getElementById('viewAllTransactionsBtn')?.addEventListener('click', () => switchTab('transactions'));

    // Filter Controls in Transactions Tab
    document.getElementById('searchInput')?.addEventListener('input', renderTransactionsTable);
    document.getElementById('typeFilter')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('categoryFilter')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('sortBy')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);

    // Bulk / Export Actions
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('exportCsvBtnSettings')?.addEventListener('click', exportToCSV);
    document.getElementById('clearAllBtn')?.addEventListener('click', clearFilteredTransactions);

    // Budget & Goals Modals
    document.getElementById('openSetBudgetBtn')?.addEventListener('click', () => openModal('budgetModal'));
    document.getElementById('closeBudgetModalBtn')?.addEventListener('click', () => closeModal('budgetModal'));
    document.getElementById('cancelBudgetModalBtn')?.addEventListener('click', () => closeModal('budgetModal'));
    document.getElementById('budgetForm')?.addEventListener('submit', handleBudgetSubmit);

    document.getElementById('openAddGoalBtn')?.addEventListener('click', () => openModal('goalModal'));
    document.getElementById('closeGoalModalBtn')?.addEventListener('click', () => closeModal('goalModal'));
    document.getElementById('cancelGoalModalBtn')?.addEventListener('click', () => closeModal('goalModal'));
    document.getElementById('goalForm')?.addEventListener('submit', handleGoalSubmit);

    // Settings Data Management
    document.getElementById('quickSampleDataBtn')?.addEventListener('click', () => {
        loadDefaultData();
        renderAll();
        showToast('Demo data loaded successfully!', 'success');
    });
    document.getElementById('loadDemoDataBtn')?.addEventListener('click', () => {
        loadDefaultData();
        renderAll();
        showToast('Demo data loaded successfully!', 'success');
    });
    document.getElementById('resetAllDataBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all transactions and reset data?')) {
            state.transactions = [];
            state.budgets = {};
            state.goals = [];
            saveStateToStorage();
            renderAll();
            showToast('All data cleared.', 'danger');
        }
    });

    document.getElementById('exportJsonBtn')?.addEventListener('click', exportToJSON);
    document.getElementById('importJsonInput')?.addEventListener('change', importFromJSON);

    // AI Chat Submission
    document.getElementById('aiChatForm')?.addEventListener('submit', handleAiChatSubmit);
}

// --- TAB NAVIGATION ---
function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    // Update Header Text
    const titleMap = {
        dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time analysis of your income, expenses, and budget.' },
        transactions: { title: 'Transactions Ledger', subtitle: 'Search, filter, edit, and export all recorded transactions.' },
        budgets: { title: 'Budgets & Savings Goals', subtitle: 'Track category spending limits and target milestones.' },
        insights: { title: 'AI Financial Advisor', subtitle: 'Automated insights and interactive Q&A assistant.' },
        settings: { title: 'Settings & Data Backup', subtitle: 'Export CSV/JSON, load demo data, or customize preferences.' }
    };

    const current = titleMap[tabName] || titleMap.dashboard;
    document.getElementById('pageTitle').textContent = current.title;
    document.getElementById('pageSubtitle').textContent = current.subtitle;

    renderAll();
}

// --- MAIN RENDER DISPATCHER ---
function renderAll() {
    renderDashboardStats();
    renderCharts();
    renderRecentTransactions();
    renderQuickHighlights();
    renderTransactionsTable();
    renderBudgets();
    renderGoals();
    renderInsightsTab();
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// --- DASHBOARD RENDERERS ---
function renderDashboardStats() {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    state.transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += Number(t.amount);
            incomeCount++;
        } else {
            totalExpense += Number(t.amount);
            expenseCount++;
        }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    document.getElementById('totalBalanceVal').textContent = formatCurrency(netBalance);
    document.getElementById('totalIncomeVal').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenseVal').textContent = formatCurrency(totalExpense);

    document.getElementById('incomeCountText').textContent = `${incomeCount} deposits`;
    document.getElementById('expenseCountText').textContent = `${expenseCount} payments`;

    // Savings Rate Badge
    const badge = document.getElementById('netSavingsBadge');
    if (badge) {
        if (savingsRate >= 0) {
            badge.className = 'trend-badge positive';
            badge.innerHTML = `<i data-lucide="trending-up"></i> ${savingsRate}% savings rate`;
        } else {
            badge.className = 'trend-badge negative';
            badge.innerHTML = `<i data-lucide="trending-down"></i> Deficit ${savingsRate}%`;
        }
    }

    // Overall Budget Progress
    let totalBudget = 0;
    Object.values(state.budgets).forEach(val => totalBudget += Number(val));

    const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
    document.getElementById('budgetUsagePercent').textContent = `${budgetPercent}%`;
    document.getElementById('budgetSpentVsTotal').textContent = `${formatCurrency(totalExpense)} / ${formatCurrency(totalBudget)}`;
    
    const progressBar = document.getElementById('overallBudgetProgressBar');
    if (progressBar) {
        progressBar.style.width = `${budgetPercent}%`;
        if (budgetPercent > 90) {
            progressBar.className = 'progress-bar warning';
        } else {
            progressBar.className = 'progress-bar';
        }
    }
}

// --- CHARTS (CHART.JS INTEGRATION) ---
function renderCharts() {
    if (typeof Chart === 'undefined') return;

    const isDark = state.theme === 'dark';
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    // 1. Expense Breakdown Donut Chart
    const categoryTotals = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const donutLabels = [];
    const donutData = [];
    const donutColors = [];

    Object.keys(categoryTotals).forEach(catKey => {
        const cat = CATEGORIES[catKey] || { name: catKey, color: '#6366f1' };
        donutLabels.push(cat.name);
        donutData.push(categoryTotals[catKey]);
        donutColors.push(cat.color);
    });

    const catCtx = document.getElementById('categoryChart')?.getContext('2d');
    if (catCtx) {
        if (categoryChartInstance) categoryChartInstance.destroy();
        categoryChartInstance = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: donutLabels.length ? donutLabels : ['No Expenses Yet'],
                datasets: [{
                    data: donutData.length ? donutData : [1],
                    backgroundColor: donutColors.length ? donutColors : ['#374151'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
                },
                cutout: '70%'
            }
        });
    }

    // 2. Trend Chart (Grouped by Date)
    const datesMap = {};
    state.transactions.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => {
        if (!datesMap[t.date]) {
            datesMap[t.date] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') datesMap[t.date].income += Number(t.amount);
        else datesMap[t.date].expense += Number(t.amount);
    });

    const labels = Object.keys(datesMap);
    const incomeSeries = labels.map(d => datesMap[d].income);
    const expenseSeries = labels.map(d => datesMap[d].expense);

    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    if (trendCtx) {
        if (trendChartInstance) trendChartInstance.destroy();
        trendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['Today'],
                datasets: [
                    {
                        label: 'Income',
                        data: incomeSeries.length ? incomeSeries : [0],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.35
                    },
                    {
                        label: 'Expense',
                        data: expenseSeries.length ? expenseSeries : [0],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.35
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
    }
}

// --- RECENT TRANSACTIONS ---
function renderRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    if (!container) return;

    const recent = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center;">No transactions recorded yet.</p>';
        return;
    }

    container.innerHTML = recent.map(t => {
        const cat = CATEGORIES[t.category] || { name: t.category, icon: 'receipt', color: '#6366f1' };
        const isExpense = t.type === 'expense';
        return `
            <div class="recent-item">
                <div class="item-left">
                    <div class="item-icon" style="background: ${cat.color}20; color: ${cat.color}">
                        <i data-lucide="${cat.icon}"></i>
                    </div>
                    <div class="item-info">
                        <h4>${escapeHtml(t.title)}</h4>
                        <span>${t.date} • ${cat.name}</span>
                    </div>
                </div>
                <div class="item-amount ${isExpense ? 'expense' : 'income'}">
                    ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// --- QUICK HIGHLIGHTS ---
function renderQuickHighlights() {
    const container = document.getElementById('quickHighlightsList');
    if (!container) return;

    let totalIncome = 0;
    let totalExpense = 0;
    const catTotals = {};

    state.transactions.forEach(t => {
        if (t.type === 'income') totalIncome += Number(t.amount);
        else {
            totalExpense += Number(t.amount);
            catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
        }
    });

    let topCategory = 'None';
    let topCatAmount = 0;
    Object.keys(catTotals).forEach(cat => {
        if (catTotals[cat] > topCatAmount) {
            topCatAmount = catTotals[cat];
            topCategory = CATEGORIES[cat]?.name || cat;
        }
    });

    container.innerHTML = `
        <div class="highlight-box tip">
            <i data-lucide="award"></i>
            <div class="highlight-text">
                <h4>Top Spending Area</h4>
                <p>Your highest expenditure is on <strong>${topCategory}</strong> (${formatCurrency(topCatAmount)}).</p>
            </div>
        </div>
        <div class="highlight-box ${totalIncome >= totalExpense ? 'good' : 'alert'}">
            <i data-lucide="${totalIncome >= totalExpense ? 'check-circle' : 'alert-circle'}"></i>
            <div class="highlight-text">
                <h4>Cashflow Health</h4>
                <p>${totalIncome >= totalExpense ? 'Positive cashflow! You are earning more than spending.' : 'Warning: Total expenses exceed income.'}</p>
            </div>
        </div>
    `;
}

// --- TRANSACTIONS TABLE & FILTERING ---
function renderTransactionsTable() {
    const tbody = document.getElementById('transactionTableBody');
    const resultCount = document.getElementById('transactionResultCount');
    if (!tbody) return;

    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const typeVal = document.getElementById('typeFilter')?.value || 'all';
    const catVal = document.getElementById('categoryFilter')?.value || 'all';
    const sortVal = document.getElementById('sortBy')?.value || 'date-desc';

    let filtered = state.transactions.filter(t => {
        const matchesQuery = t.title.toLowerCase().includes(query) ||
                             (t.note && t.note.toLowerCase().includes(query)) ||
                             (t.tags && t.tags.join(' ').toLowerCase().includes(query));
        const matchesType = typeVal === 'all' || t.type === typeVal;
        const matchesCat = catVal === 'all' || t.category === catVal;
        return matchesQuery && matchesType && matchesCat;
    });

    // Sorting
    filtered.sort((a, b) => {
        if (sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortVal === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortVal === 'amount-desc') return Number(b.amount) - Number(a.amount);
        if (sortVal === 'amount-asc') return Number(a.amount) - Number(b.amount);
        return 0;
    });

    if (resultCount) {
        resultCount.textContent = `Showing ${filtered.length} of ${state.transactions.length} transactions`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-muted" style="text-align:center; padding: 2rem;">No matching transactions found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const cat = CATEGORIES[t.category] || { name: t.category, color: '#6366f1', icon: 'receipt' };
        const isExpense = t.type === 'expense';
        return `
            <tr>
                <td>${t.date}</td>
                <td>
                    <strong>${escapeHtml(t.title)}</strong>
                    ${t.note ? `<br><small class="text-muted">${escapeHtml(t.note)}</small>` : ''}
                </td>
                <td>
                    <span class="category-badge" style="background: ${cat.color}20; color: ${cat.color};">
                        <i data-lucide="${cat.icon}"></i> ${cat.name}
                    </span>
                </td>
                <td><span class="payment-tag">${t.payment || 'Cash'}</span></td>
                <td><span class="type-pill ${t.type}">${t.type}</span></td>
                <td class="${isExpense ? 'expense' : 'income'}" style="font-weight: 800;">
                    ${isExpense ? '-' : '+'}${formatCurrency(t.amount)}
                </td>
                <td class="text-right">
                    <div class="action-btns">
                        <button class="icon-btn edit" onclick="editTransaction('${t.id}')" title="Edit"><i data-lucide="edit-3"></i></button>
                        <button class="icon-btn delete" onclick="deleteTransaction('${t.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function resetFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('typeFilter')) document.getElementById('typeFilter').value = 'all';
    if (document.getElementById('categoryFilter')) document.getElementById('categoryFilter').value = 'all';
    if (document.getElementById('sortBy')) document.getElementById('sortBy').value = 'date-desc';
    renderTransactionsTable();
}

function clearFilteredTransactions() {
    if (confirm('Delete all currently displayed transactions in table?')) {
        const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const typeVal = document.getElementById('typeFilter')?.value || 'all';
        const catVal = document.getElementById('categoryFilter')?.value || 'all';

        state.transactions = state.transactions.filter(t => {
            const matchesQuery = t.title.toLowerCase().includes(query) || (t.note && t.note.toLowerCase().includes(query));
            const matchesType = typeVal === 'all' || t.type === typeVal;
            const matchesCat = catVal === 'all' || t.category === catVal;
            return !(matchesQuery && matchesType && matchesCat);
        });

        saveStateToStorage();
        renderAll();
        showToast('Filtered transactions cleared.', 'warning');
    }
}

// --- TRANSACTION MODAL & CRUD ---
function openTransactionModal(editId = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('modalTitle');
    if (!modal || !form) return;

    state.editingTransactionId = editId;

    if (editId) {
        const item = state.transactions.find(t => t.id === editId);
        if (item) {
            title.innerHTML = '<i data-lucide="edit-3"></i> Edit Transaction';
            document.getElementById('transactionId').value = item.id;
            document.getElementById('transType').value = item.type;
            document.getElementById('transAmount').value = item.amount;
            document.getElementById('transTitle').value = item.title;
            document.getElementById('transCategory').value = item.category;
            document.getElementById('transPayment').value = item.payment || 'Credit Card';
            document.getElementById('transDate').value = item.date;
            document.getElementById('transTags').value = (item.tags || []).join(', ');
            document.getElementById('transNote').value = item.note || '';
        }
    } else {
        title.innerHTML = '<i data-lucide="plus-circle"></i> Add Transaction';
        form.reset();
        document.getElementById('transactionId').value = '';
        document.getElementById('transDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('open');
    if (window.lucide) lucide.createIcons();
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) modal.classList.remove('open');
    state.editingTransactionId = null;
}

function handleTransactionFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('transactionId').value || 't_' + Date.now();
    const type = document.getElementById('transType').value;
    const amount = parseFloat(document.getElementById('transAmount').value);
    const title = document.getElementById('transTitle').value.trim();
    const category = document.getElementById('transCategory').value;
    const payment = document.getElementById('transPayment').value;
    const date = document.getElementById('transDate').value;
    const tags = document.getElementById('transTags').value.split(',').map(s => s.trim()).filter(Boolean);
    const note = document.getElementById('transNote').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid title and positive amount.', 'danger');
        return;
    }

    const transactionData = { id, type, amount, title, category, payment, date, tags, note };

    const index = state.transactions.findIndex(t => t.id === id);
    if (index >= 0) {
        state.transactions[index] = transactionData;
        showToast('Transaction updated successfully!', 'success');
    } else {
        state.transactions.unshift(transactionData);
        showToast('New transaction recorded!', 'success');
    }

    saveStateToStorage();
    closeTransactionModal();
    renderAll();
}

window.editTransaction = function(id) {
    openTransactionModal(id);
};

window.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to remove this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveStateToStorage();
        renderAll();
        showToast('Transaction removed', 'warning');
    }
};

// --- BUDGETS & GOALS ---
function renderBudgets() {
    const grid = document.getElementById('budgetsGrid');
    if (!grid) return;

    const expenseTotals = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseTotals[t.category] = (expenseTotals[t.category] || 0) + Number(t.amount);
    });

    const budgetKeys = Object.keys(state.budgets);
    if (budgetKeys.length === 0) {
        grid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No budget limits configured. Click "Set Category Budget" to set limits.</p>';
        return;
    }

    grid.innerHTML = budgetKeys.map(catKey => {
        const cat = CATEGORIES[catKey] || { name: catKey, color: '#6366f1', icon: 'pie-chart' };
        const limit = Number(state.budgets[catKey]);
        const spent = expenseTotals[catKey] || 0;
        const percent = Math.min(100, Math.round((spent / limit) * 100));
        const isOver = spent > limit;

        return `
            <div class="budget-card">
                <div class="budget-card-header">
                    <div class="budget-cat-title" style="color: ${cat.color};">
                        <i data-lucide="${cat.icon}"></i> ${cat.name}
                    </div>
                    <button class="icon-btn delete" onclick="deleteBudget('${catKey}')" title="Delete Limit"><i data-lucide="x"></i></button>
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem;">
                    ${formatCurrency(spent)} <span class="text-muted" style="font-size: 0.9rem; font-weight:500;">/ ${formatCurrency(limit)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${isOver ? 'warning' : ''}" style="width: ${percent}%;"></div>
                </div>
                <div style="display:flex; justify-between; font-size: 0.78rem; margin-top: 0.4rem;">
                    <span class="${isOver ? 'expense' : 'text-muted'}">${isOver ? 'Over budget!' : percent + '% used'}</span>
                    <span class="text-muted">${formatCurrency(Math.max(0, limit - spent))} remaining</span>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    const cat = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    if (cat && limit > 0) {
        state.budgets[cat] = limit;
        saveStateToStorage();
        closeModal('budgetModal');
        renderAll();
        showToast('Budget limit updated!', 'success');
    }
}

window.deleteBudget = function(catKey) {
    delete state.budgets[catKey];
    saveStateToStorage();
    renderAll();
    showToast('Budget limit deleted', 'info');
};

function renderGoals() {
    const grid = document.getElementById('goalsGrid');
    if (!grid) return;

    if (state.goals.length === 0) {
        grid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No savings goals added yet.</p>';
        return;
    }

    grid.innerHTML = state.goals.map(g => {
        const percent = Math.min(100, Math.round((g.current / g.target) * 100));
        return `
            <div class="goal-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem;">
                    <h3 style="font-size: 1rem; font-weight: 700;">${escapeHtml(g.title)}</h3>
                    <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">${percent}%</span>
                </div>
                <div style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem;">
                    ${formatCurrency(g.current)} <span class="text-muted" style="font-size: 0.85rem; font-weight: 500;">target ${formatCurrency(g.target)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percent}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-sm btn-secondary" onclick="updateGoalProgress('${g.id}', 100)" style="flex-grow:1;">+ $100</button>
                    <button class="btn btn-sm btn-secondary" onclick="updateGoalProgress('${g.id}', 500)" style="flex-grow:1;">+ $500</button>
                    <button class="icon-btn delete" onclick="deleteGoal('${g.id}')"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function handleGoalSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('goalTitle').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;

    if (title && target > 0) {
        state.goals.push({ id: 'g_' + Date.now(), title, target, current });
        saveStateToStorage();
        closeModal('goalModal');
        renderAll();
        showToast('New savings goal added!', 'success');
    }
}

window.updateGoalProgress = function(id, amount) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
        goal.current = Math.min(goal.target, goal.current + amount);
        saveStateToStorage();
        renderAll();
        showToast(`Added ${formatCurrency(amount)} to ${goal.title}`, 'success');
    }
};

window.deleteGoal = function(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveStateToStorage();
    renderAll();
    showToast('Goal removed', 'info');
};

// --- AI INSIGHTS TAB ---
function renderInsightsTab() {
    const riskBox = document.getElementById('riskAssessmentContent');
    const tipsBox = document.getElementById('savingsTipsContent');
    if (!riskBox || !tipsBox) return;

    let totalIncome = 0;
    let totalExpense = 0;
    const catExpenses = {};

    state.transactions.forEach(t => {
        if (t.type === 'income') totalIncome += Number(t.amount);
        else {
            totalExpense += Number(t.amount);
            catExpenses[t.category] = (catExpenses[t.category] || 0) + Number(t.amount);
        }
    });

    // Risk items
    const risks = [];
    if (totalExpense > totalIncome) {
        risks.push(`<strong>Deficit Alert:</strong> Your total monthly expenses (${formatCurrency(totalExpense)}) exceed total income (${formatCurrency(totalIncome)}). Consider reviewing non-essential spending.`);
    }

    Object.keys(state.budgets).forEach(cat => {
        const spent = catExpenses[cat] || 0;
        const limit = state.budgets[cat];
        if (spent > limit) {
            risks.push(`<strong>Budget Breach:</strong> You exceeded your ${CATEGORIES[cat]?.name || cat} budget limit by ${formatCurrency(spent - limit)}.`);
        }
    });

    if (risks.length === 0) {
        riskBox.innerHTML = '<div class="insight-item" style="border-left-color: var(--success);"><p>Great financial health! No budget breaches or deficit alerts detected.</p></div>';
    } else {
        riskBox.innerHTML = risks.map(r => `<div class="insight-item" style="border-left-color: var(--warning);"><p>${r}</p></div>`).join('');
    }

    // Savings Tips
    const tips = [];
    if (catExpenses['food'] > 300) {
        tips.push(`<strong>Dining Optimization:</strong> Food & Dining spending is currently ${formatCurrency(catExpenses['food'])}. Preparing meals at home twice more per week could save ~${formatCurrency(120)} monthly.`);
    }
    if (totalIncome > 0 && (totalIncome - totalExpense) > 500) {
        tips.push(`<strong>Surplus Capital:</strong> You have an estimated ${formatCurrency(totalIncome - totalExpense)} monthly surplus. Consider allocating 50% toward your high-priority savings goals.`);
    }
    tips.push(`<strong>Subscription Audit:</strong> Review recurring card charges for unused memberships or automated software renewals.`);

    tipsBox.innerHTML = tips.map(t => `<div class="insight-item" style="border-left-color: var(--accent-primary);"><p>${t}</p></div>`).join('');
}

// --- AI CHAT SIMULATOR ---
function handleAiChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('aiChatInput');
    const history = document.getElementById('chatHistory');
    if (!input || !history) return;

    const query = input.value.trim();
    if (!query) return;

    // Append User Message
    history.innerHTML += `
        <div class="chat-message user">
            <div class="msg-avatar"><i data-lucide="user"></i></div>
            <div class="msg-content">${escapeHtml(query)}</div>
        </div>
    `;

    input.value = '';
    history.scrollTop = history.scrollHeight;

    // Generate Smart Bot Response
    setTimeout(() => {
        const responseText = generateFinancialAiResponse(query.toLowerCase());
        history.innerHTML += `
            <div class="chat-message assistant">
                <div class="msg-avatar"><i data-lucide="bot"></i></div>
                <div class="msg-content">${responseText}</div>
            </div>
        `;
        history.scrollTop = history.scrollHeight;
        if (window.lucide) lucide.createIcons();
    }, 400);
}

function generateFinancialAiResponse(q) {
    let totalIncome = 0;
    let totalExpense = 0;
    const catTotals = {};

    state.transactions.forEach(t => {
        if (t.type === 'income') totalIncome += Number(t.amount);
        else {
            totalExpense += Number(t.amount);
            catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
        }
    });

    if (q.includes('highest') || q.includes('most') || q.includes('top expense')) {
        let maxCat = '';
        let maxAmt = 0;
        Object.keys(catTotals).forEach(c => {
            if (catTotals[c] > maxAmt) { maxAmt = catTotals[c]; maxCat = CATEGORIES[c]?.name || c; }
        });
        return `Your highest spending category is <strong>${maxCat}</strong> with a total of <strong>${formatCurrency(maxAmt)}</strong>.`;
    }

    if (q.includes('save') || q.includes('saved') || q.includes('surplus')) {
        const savings = totalIncome - totalExpense;
        return `Your current net savings is <strong>${formatCurrency(savings)}</strong> (Income: ${formatCurrency(totalIncome)} - Expenses: ${formatCurrency(totalExpense)}).`;
    }

    if (q.includes('budget') || q.includes('limit')) {
        return `You have set budget limits across <strong>${Object.keys(state.budgets).length}</strong> categories. Total monthly budget ceiling is <strong>${formatCurrency(Object.values(state.budgets).reduce((a,b)=>a+Number(b),0))}</strong>.`;
    }

    return `Based on your records: Total Income is <strong>${formatCurrency(totalIncome)}</strong>, Total Expenses are <strong>${formatCurrency(totalExpense)}</strong> across ${state.transactions.length} transactions.`;
}

// --- EXPORT & IMPORT ---
function exportToCSV() {
    if (state.transactions.length === 0) {
        showToast('No transactions to export', 'warning');
        return;
    }

    let csv = 'ID,Date,Title,Type,Category,Amount,PaymentMethod,Tags,Note\n';
    state.transactions.forEach(t => {
        const cat = CATEGORIES[t.category]?.name || t.category;
        const tags = (t.tags || []).join(';');
        csv += `"${t.id}","${t.date}","${t.title.replace(/"/g, '""')}","${t.type}","${cat}",${t.amount},"${t.payment || ''}","${tags}","${(t.note || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexExpense_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('CSV export downloaded!', 'success');
}

function exportToJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ApexExpense_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Full JSON backup exported!', 'success');
}

function importFromJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (data.transactions && Array.isArray(data.transactions)) {
                state.transactions = data.transactions;
                state.budgets = data.budgets || {};
                state.goals = data.goals || [];
                if (data.currency) state.currency = data.currency;
                saveStateToStorage();
                renderAll();
                showToast('Backup JSON imported successfully!', 'success');
            } else {
                showToast('Invalid JSON structure', 'danger');
            }
        } catch (err) {
            showToast('Failed to parse JSON file', 'danger');
        }
    };
    reader.readAsText(file);
}

// --- UTILITY HELPERS ---
function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('open');
}

function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('open');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-octagon' : 'info'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
