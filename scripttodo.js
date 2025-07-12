   // Task Manager Application
        class TaskManager {
            constructor() {
                this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.renderTasks();
                this.updateStatistics();
                this.initializeCharts();
            }

            setupEventListeners() {
                const form = document.getElementById('taskForm');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addTask();
                });
            }

            addTask() {
                const title = document.getElementById('taskTitle').value;
                const description = document.getElementById('taskDescription').value;
                const priority = document.getElementById('taskPriority').value;
                const category = document.getElementById('taskCategory').value;
                const dueDate = document.getElementById('taskDueDate').value;
                const dueTime = document.getElementById('taskDueTime').value;

                const task = {
                    id: Date.now(),
                    title,
                    description,
                    priority,
                    category,
                    dueDate,
                    dueTime,
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.tasks.push(task);
                this.saveTasks();
                this.renderTasks();
                this.updateStatistics();
                this.clearForm();
            }

            completeTask(taskId) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = true;
                    task.completedAt = new Date().toISOString();
                    this.saveTasks();
                    this.renderTasks();
                    this.updateStatistics();
                }
            }

            deleteTask(taskId) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.renderTasks(); // Re-render after deletion
                this.updateStatistics();
            }

            renderTasks() {
                const pendingTasksList = document.getElementById('pendingTasksList');
                const completedTasksList = document.getElementById('completedTasksList');

                const pendingTasks = this.tasks.filter(task => !task.completed);
                const completedTasks = this.tasks.filter(task => task.completed);

                pendingTasksList.innerHTML = pendingTasks.map(task => this.createTaskElement(task)).join('');
                completedTasksList.innerHTML = completedTasks.map(task => this.createTaskElement(task)).join('');
            }

            createTaskElement(task) {
                const dueDateTime = task.dueDate ? new Date(`${task.dueDate} ${task.dueTime || '23:59'}`).toLocaleString() : 'No due date';
                
                return `
                    <div class="task-item">
                        <div class="task-header">
                            <div class="task-title">${task.title}</div>
                            <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
                        </div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        <div class="task-meta">
                            <span>📁 ${task.category}</span>
                            <span>📅 ${dueDateTime}</span>
                        </div>
                        <div class="task-actions">
                            ${!task.completed ? `<button class="action-btn complete-btn" onclick="taskManager.completeTask(${task.id})">✓</button>` : ''}
                            <button class="action-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">🗑️</button>
                        </div>
                    </div>
                `;
            }

            updateStatistics() {
                const totalTasks = this.tasks.length;
                const completedTasks = this.tasks.filter(task => task.completed).length;
                const pendingTasks = totalTasks - completedTasks;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                document.getElementById('totalTasks').textContent = totalTasks;
                document.getElementById('completedTasks').textContent = completedTasks;
                document.getElementById('pendingTasks').textContent = pendingTasks;
                document.getElementById('completionRate').textContent = `${completionRate}%`;

                this.updateCategoryBreakdown();
                this.updateCharts();
            }

            updateCategoryBreakdown() {
                const categoryBreakdown = document.getElementById('categoryBreakdown');
                const categories = {};

                this.tasks.forEach(task => {
                    categories[task.category] = (categories[task.category] || 0) + 1;
                });

                categoryBreakdown.innerHTML = Object.entries(categories)
                    .map(([category, count]) => `
                        <div class="category-item">
                            <div class="category-count">${count}</div>
                            <div class="category-label">${category.toUpperCase()}</div>
                        </div>
                    `).join('');
            }

            initializeCharts() {
                // Tasks Overview Chart
                const ctx1 = document.getElementById('tasksChart').getContext('2d');
                this.tasksChart = new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'Pending'],
                        datasets: [{
                            data: [0, 0],
                            backgroundColor: ['#10b981', '#f59e0b']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });

                // Weekly Productivity Chart
                const ctx2 = document.getElementById('productivityChart').getContext('2d');
                this.productivityChart = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Tasks Completed',
                            data: [],
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
                this.updateCharts();
            }

            updateCharts() {
                const completedTasks = this.tasks.filter(task => task.completed).length;
                const pendingTasks = this.tasks.length - completedTasks;

                // Update Tasks Overview Chart
                if (this.tasksChart) {
                    this.tasksChart.data.datasets[0].data = [completedTasks, pendingTasks];
                    this.tasksChart.update();
                }

                // Update Weekly Productivity Chart
                if (this.productivityChart) {
                    this.productivityChart.data.datasets[0].data = this.getWeeklyProductivityData();
                    this.productivityChart.update();
                }
            }


            getWeeklyProductivityData() {
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to start from Monday

                const weeklyCompletedTasks = new Array(7).fill(0); // For Mon to Sun

                this.tasks.forEach(task => {
                    if (task.completed && task.completedAt) {
                        const completedDate = new Date(task.completedAt);
                        const diffTime = Math.abs(completedDate - weekStart);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= 0 && diffDays < 7) {
                            weeklyCompletedTasks[diffDays]++;
                        }
                    }
                });
                return weeklyCompletedTasks;
            }

            clearForm() {
                document.getElementById('taskForm').reset();
            }

            saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(this.tasks));
                if (window.opener && typeof window.opener.loadHighPriorityTasks === 'function') {
                    window.opener.loadHighPriorityTasks();
                } else if (window.parent && typeof window.parent.loadHighPriorityTasks === 'function') {
                    window.parent.loadHighPriorityTasks();
                }
            }
        }

        // Initialize the Task Manager
        const taskManager = new TaskManager();

        // Theme toggle functionality
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            const body = document.body;
            
            // Check for saved theme preference or default to light mode
            const currentTheme = localStorage.getItem('theme') || 'light';
            body.setAttribute('data-theme', currentTheme);

            // Set initial icon based on theme
            if (currentTheme === 'dark') {
                themeToggleBtn.querySelector('.sun-icon').style.display = 'none';
                themeToggleBtn.querySelector('.moon-icon').style.display = 'inline';
            } else {
                themeToggleBtn.querySelector('.sun-icon').style.display = 'inline';
                themeToggleBtn.querySelector('.moon-icon').style.display = 'none';
            }

            // Theme toggle event listener
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Toggle icons
                if (newTheme === 'dark') {
                    themeToggleBtn.querySelector('.sun-icon').style.display = 'none';
                    themeToggleBtn.querySelector('.moon-icon').style.display = 'inline';
                } else {
                    themeToggleBtn.querySelector('.sun-icon').style.display = 'inline';
                    themeToggleBtn.querySelector('.moon-icon').style.display = 'none';
                }
                
                // Add a little animation effect
                themeToggleBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    themeToggleBtn.style.transform = 'scale(1)';
                }, 150);
            });
        });