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

        // Simple Habit Tracker Application
        class HabitTracker {
            constructor() {
                this.habits = JSON.parse(localStorage.getItem('habits')) || [];
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.renderHabits();
                this.updateStats();
            }

            setupEventListeners() {
                document.getElementById('habitForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addHabit();
                });
            }

            addHabit() {
                const habit = {
                    id: Date.now(),
                    name: document.getElementById('habitName').value,
                    description: document.getElementById('habitDescription').value,
                    category: document.getElementById('habitCategory').value,
                    streak: 0,
                    completions: [],
                    created: new Date().toISOString()
                };

                this.habits.push(habit);
                this.saveHabits();
                this.renderHabits();
                this.updateStats();
                this.clearForm();
                
                this.showMessage('Habit added successfully! 🎉');
            }

            renderHabits() {
                const habitsList = document.getElementById('habitsList');
                
                if (this.habits.length === 0) {
                    habitsList.innerHTML = `
                        <div class="empty-state">
                            <div class="icon">🌟</div>
                            <h4>No habits yet</h4>
                            <p>Add your first habit to get started!</p>
                        </div>
                    `;
                    return;
                }

                habitsList.innerHTML = this.habits.map(habit => {
                    const today = new Date().toDateString();
                    const completedToday = habit.completions.includes(today);
                    
                    return `
                        <div class="habit-item">
                            <div class="habit-header">
                                <div class="habit-name">${habit.name}</div>
                                <div class="habit-streak">${habit.streak} day streak</div>
                            </div>
                            <div class="habit-description">${habit.description}</div>
                            <div class="habit-actions">
                                ${!completedToday ? 
                                    `<button class="action-btn complete" onclick="habitTracker.completeHabit(${habit.id})">Complete</button>` : 
                                    `<button class="action-btn" disabled>Completed ✓</button>`
                                }
                                <button class="action-btn delete" onclick="habitTracker.deleteHabit(${habit.id})">Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            completeHabit(habitId) {
                const habit = this.habits.find(h => h.id === habitId);
                if (!habit) return;

                const today = new Date().toDateString();
                if (!habit.completions.includes(today)) {
                    habit.completions.push(today);
                    
                    // Update streak
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayString = yesterday.toDateString();
                    
                    if (habit.completions.includes(yesterdayString)) {
                        habit.streak++;
                    } else {
                        habit.streak = 1;
                    }
                    
                    this.saveHabits();
                    this.renderHabits();
                    this.updateStats();
                    
                    this.showMessage('Great job! Habit completed for today! 🎉');
                }
            }

            deleteHabit(habitId) {
                if (confirm('Are you sure you want to delete this habit?')) {
                    this.habits = this.habits.filter(h => h.id !== habitId);
                    this.saveHabits();
                    this.renderHabits();
                    this.updateStats();
                    this.showMessage('Habit deleted successfully.');
                }
            }

            updateStats() {
                const activeHabits = this.habits.length;
                const longestStreak = Math.max(...this.habits.map(h => h.streak), 0);
                
                const today = new Date().toDateString();
                const completedToday = this.habits.filter(h => h.completions.includes(today)).length;
                const completionRate = activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0;

                document.getElementById('activeHabits').textContent = activeHabits;
                document.getElementById('longestStreak').textContent = longestStreak;
                document.getElementById('completionRate').textContent = `${completionRate}%`;
            }

            showMessage(message) {
                // Simple message system
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
                document.getElementById('habitForm').reset();
            }

            saveHabits() {
                localStorage.setItem('habits', JSON.stringify(this.habits));
            }
        }

        // Initialize the Habit Tracker
        const habitTracker = new HabitTracker();