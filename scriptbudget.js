 // Theme Toggle Functionality
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            
            // Check for saved theme preference or default to light mode
            const currentTheme = localStorage.getItem('theme') || 'light';
            body.setAttribute('data-theme', currentTheme);

            // Theme toggle event listener
            themeToggle.addEventListener('click', () => {
                const currentTheme = body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Add animation effect
                themeToggle.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    themeToggle.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Budget Tracker Application
        class BudgetTracker {
            constructor() {
                this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
                this.currentType = 'income';
                this.categories = {
                    income: ['Salary', 'Business', 'Freelance', 'Investments', 'Rental', 'Other'],
                    expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'],
                    savings: ['Emergency Fund', 'Retirement', 'Goals', 'Fixed Deposit', 'Mutual Funds', 'Other'],
                    investment: ['Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Gold', 'Crypto', 'Other']
                };
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setDefaultDate();
                this.updateCategories();
                this.renderTransactions();
                this.updateSummary();
                this.renderCategoryBreakdown();
            }

            setupEventListeners() {
                // Transaction type tabs
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.currentType = e.target.dataset.type;
                        this.updateCategories();
                        this.updateSubmitButton();
                    });
                });

                // Transaction form
                document.getElementById('transactionForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addTransaction();
                });
            }

            setDefaultDate() {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('date').value = today;
            }

            updateCategories() {
                const categorySelect = document.getElementById('category');
                const categories = this.categories[this.currentType];
                
                categorySelect.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            }

            updateSubmitButton() {
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.className = `submit-btn ${this.currentType}`;
                submitBtn.textContent = `Add ${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}`;
            }

            addTransaction() {
                const transaction = {
                    id: Date.now(),
                    type: this.currentType,
                    description: document.getElementById('description').value,
                    amount: parseFloat(document.getElementById('amount').value),
                    category: document.getElementById('category').value,
                    date: document.getElementById('date').value,
                    created: new Date().toISOString()
                };

                this.transactions.push(transaction);
                this.saveTransactions();
                this.renderTransactions();
                this.updateSummary();
                this.renderCategoryBreakdown();
                this.clearForm();
                
                this.showMessage(`${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)} added successfully! 🎉`);
            }

            renderTransactions() {
                const transactionsList = document.getElementById('transactionsList');
                
                if (this.transactions.length === 0) {
                    transactionsList.innerHTML = `
                        <div class="empty-state">
                            <div class="icon">💳</div>
                            <h4>No transactions yet</h4>
                            <p>Add your first transaction to get started!</p>
                        </div>
                    `;
                    return;
                }

                // Sort transactions by date (newest first)
                const sortedTransactions = this.transactions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10);

                transactionsList.innerHTML = sortedTransactions.map(transaction => {
                    const typeIcons = {
                        income: '💰',
                        expense: '💸',
                        savings: '🏦',
                        investment: '📈'
                    };

                    return `
                        <div class="transaction-item">
                            <div class="transaction-details">
                                <div class="transaction-description">${transaction.description}</div>
                                <div class="transaction-meta">
                                    <span>${typeIcons[transaction.type]} ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                                    <span>📁 ${transaction.category}</span>
                                    <span>📅 ${new Date(transaction.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="transaction-amount ${transaction.type}">
                                ₹${transaction.amount.toFixed(2)}
                                <button class="delete-btn" onclick="budgetTracker.deleteTransaction(${transaction.id})">×</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            updateSummary() {
                const income = this.transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);

                const expense = this.transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                const savings = this.transactions
                    .filter(t => t.type === 'savings')
                    .reduce((sum, t) => sum + t.amount, 0);

                const investment = this.transactions
                    .filter(t => t.type === 'investment')
                    .reduce((sum, t) => sum + t.amount, 0);

                document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
                document.getElementById('totalExpense').textContent = `₹${expense.toFixed(2)}`;
                document.getElementById('totalSavings').textContent = `₹${savings.toFixed(2)}`;
                document.getElementById('totalInvestment').textContent = `₹${investment.toFixed(2)}`;
            }

            renderCategoryBreakdown() {
                const categoryBreakdown = document.getElementById('categoryBreakdown');
                const categoryTotals = {};

                // Calculate totals for each category
                this.transactions.forEach(transaction => {
                    const key = `${transaction.type}-${transaction.category}`;
                    if (!categoryTotals[key]) {
                        categoryTotals[key] = {
                            type: transaction.type,
                            category: transaction.category,
                            amount: 0
                        };
                    }
                    categoryTotals[key].amount += transaction.amount;
                });

                const categoryIcons = {
                    income: '💰',
                    expense: '💸',
                    savings: '🏦',
                    investment: '📈'
                };

                if (Object.keys(categoryTotals).length === 0) {
                    categoryBreakdown.innerHTML = '<p style="text-align: center; color: #6b7280;">No category data available</p>';
                    return;
                }

                categoryBreakdown.innerHTML = Object.values(categoryTotals).map(item => `
                    <div class="category-item">
                        <div class="category-icon">${categoryIcons[item.type]}</div>
                        <div class="category-name">${item.category}</div>
                        <div class="category-amount ${item.type}">₹${item.amount.toFixed(2)}</div>
                    </div>
                `).join('');
            }

            deleteTransaction(id) {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    this.transactions = this.transactions.filter(t => t.id !== id);
                    this.saveTransactions();
                    this.renderTransactions();
                    this.updateSummary();
                    this.renderCategoryBreakdown();
                    this.showMessage('Transaction deleted successfully.');
                }
            }

            showMessage(message) {
                const messageDiv = document.createElement('div');
                messageDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                `;
                messageDiv.textContent = message;
                document.body.appendChild(messageDiv);
                
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            }

            clearForm() {
                document.getElementById('transactionForm').reset();
                this.setDefaultDate();
            }

            saveTransactions() {
                localStorage.setItem('budgetTransactions', JSON.stringify(this.transactions));
            }
        }

        // Initialize the Budget Tracker
        const budgetTracker = new BudgetTracker();