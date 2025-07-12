document.addEventListener('DOMContentLoaded', () => {
        class HealthTracker {
            constructor() {
                this.data = JSON.parse(localStorage.getItem('healthData')) || {
                    height: 0,
                    weight: 0,
                    bmi: 0,
                    dailyCalories: 0,
                    goalCalories: 0,
                    goal: null, // 'loss' or 'gain'
                    water: 0,
                    waterGoal: 2.5,
                    steps: 0,
                    stepsGoal: 10000,
                    caloriesBurned: 0,
                    sleepStart: null,
                    sleepEnd: null,
                    sleepDuration: 0
                };
                this.init();
                // Make the instance globally accessible
                window.healthTracker = this;
            }

            init() {
                this.setupEventListeners();
                this.updateDisplay();
                this.showExistingProfile();
            }

            setupEventListeners() {
                document.getElementById('profileForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.calculateBMI();
                });

                document.getElementById('sleepForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.recordSleep();
                });
            }

            calculateBMI() {
                const height = parseFloat(document.getElementById('height').value);
                const weight = parseFloat(document.getElementById('weight').value);

                if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
                    alert('Please enter valid height and weight values.');
                    return;
                }

                this.data.height = height;
                this.data.weight = weight;
                this.data.bmi = (weight / ((height / 100) ** 2)).toFixed(1);

                // Calculate BMR (Basal Metabolic Rate) - simplified calculation
                // Using Mifflin-St Jeor Equation (assuming average age and activity)
                this.data.dailyCalories = Math.round(10 * weight + 6.25 * height - 5 * 25 + 5); // For males
                // For females, subtract 161 instead of adding 5

                this.showBMIResults();
                this.saveData();
                this.updateDisplay();
            }

            showBMIResults() {
                const bmiValue = parseFloat(this.data.bmi);
                let category = '';
                let categoryColor = '';

                if (bmiValue < 18.5) {
                    category = 'Underweight';
                    categoryColor = '#3b82f6';
                } else if (bmiValue < 25) {
                    category = 'Normal weight';
                    categoryColor = '#10b981';
                } else if (bmiValue < 30) {
                    category = 'Overweight';
                    categoryColor = '#f59e0b';
                } else {
                    category = 'Obese';
                    categoryColor = '#ef4444';
                }

                document.getElementById('bmiValue').textContent = this.data.bmi;
                document.getElementById('bmiCategory').textContent = category;
                document.getElementById('bmiCategory').style.color = categoryColor;
                document.getElementById('dailyCalories').textContent = this.data.dailyCalories;
                document.getElementById('bmiResults').style.display = 'block';
            }

            showExistingProfile() {
                if (this.data.height && this.data.weight) {
                    document.getElementById('height').value = this.data.height;
                    document.getElementById('weight').value = this.data.weight;
                    this.showBMIResults();
                    if (this.data.goal) {
                        document.getElementById('goalCalories').style.display = 'block';
                        document.getElementById('goalCalorieValue').textContent = this.data.goalCalories;
                    }
                }
            }

            setGoal(goalType) {
                this.data.goal = goalType;
                if (goalType === 'loss') {
                    this.data.goalCalories = this.data.dailyCalories - 400;
                } else if (goalType === 'gain') {
                    this.data.goalCalories = this.data.dailyCalories + 400;
                }

                document.getElementById('goalCalories').style.display = 'block';
                document.getElementById('goalCalorieValue').textContent = this.data.goalCalories;
                this.saveData();
                
                const goalText = goalType === 'loss' ? 'Weight Loss' : 'Weight Gain';
                alert(`${goalText} goal set! Target: ${this.data.goalCalories} calories per day.`);
            }

            addWater(amount) {
                this.data.water += amount;
                if (this.data.water > this.data.waterGoal) this.data.water = this.data.waterGoal;
                this.updateDisplay();
                this.saveData();
                
                const percentage = Math.round((this.data.water / this.data.waterGoal) * 100);
                if (percentage >= 100) {
                    alert('🎉 Great job! You\'ve reached your daily water goal!');
                }
            }

            removeWater(amount) {
                this.data.water -= amount;
                if (this.data.water < 0) this.data.water = 0;
                this.updateDisplay();
                this.saveData();
            }

            addSteps(stepCount) {
                this.data.steps += stepCount;
                if (this.data.steps > 50000) this.data.steps = 50000; // Reasonable daily limit
                
                // Calculate calories burned from steps (rough estimation: 0.04 calories per step)
                this.data.caloriesBurned = Math.round(this.data.steps * 0.04);
                
                this.updateDisplay();
                this.saveData();
                
                const percentage = Math.round((this.data.steps / this.data.stepsGoal) * 100);
                if (percentage >= 100 && this.data.steps <= this.data.stepsGoal + stepCount) {
                    alert('🎉 Awesome! You\'ve reached your daily step goal!');
                }
            }

            removeSteps(stepCount) {
                this.data.steps -= stepCount;
                if (this.data.steps < 0) this.data.steps = 0;
                
                // Recalculate calories burned
                this.data.caloriesBurned = Math.round(this.data.steps * 0.04);
                
                this.updateDisplay();
                this.saveData();
            }

            recordSleep() {
                const bedTime = document.getElementById('bedTime').value;
                const wakeTime = document.getElementById('wakeTime').value;

                if (!bedTime || !wakeTime) {
                    alert('Please enter both sleep and wake times.');
                    return;
                }

                const sleepDate = new Date(`2000-01-01 ${bedTime}`);
                const wakeDate = new Date(`2000-01-${bedTime > wakeTime ? '02' : '01'} ${wakeTime}`);
                
                const diffMs = wakeDate - sleepDate;
                const diffHours = diffMs / (1000 * 60 * 60);

                this.data.sleepStart = bedTime;
                this.data.sleepEnd = wakeTime;
                this.data.sleepDuration = diffHours;

                this.showSleepResults(diffHours);
                this.saveData();
            }

            showSleepResults(hours) {
                const h = Math.floor(hours);
                const m = Math.round((hours - h) * 60);
                
                document.getElementById('sleepDuration').textContent = `${h}h ${m}m`;
                
                let quality = '';
                let qualityColor = '';
                
                if (hours < 6) {
                    quality = 'Poor - Too little sleep';
                    qualityColor = '#ef4444';
                } else if (hours >= 6 && hours < 7) {
                    quality = 'Fair - Could be better';
                    qualityColor = '#f59e0b';
                } else if (hours >= 7 && hours <= 9) {
                    quality = 'Good - Optimal range';
                    qualityColor = '#10b981';
                } else {
                    quality = 'Fair - Too much sleep';
                    qualityColor = '#f59e0b';
                }

                const qualityElement = document.getElementById('sleepQuality');
                qualityElement.innerHTML = `<span class="sleep-icon">⭐</span>Quality: ${quality}`;
                qualityElement.style.color = qualityColor;
                
                document.getElementById('sleepResults').style.display = 'block';
                
                if (hours >= 7 && hours <= 9) {
                    setTimeout(() => alert('😴 Excellent sleep! You got the recommended amount of rest.'), 500);
                }
            }

            updateDisplay() {
                // Update water display
                document.getElementById('waterCurrent').textContent = this.data.water.toFixed(1);
                document.getElementById('waterProgress').style.width = `${Math.min((this.data.water / this.data.waterGoal) * 100, 100)}%`;

                // Update steps display
                document.getElementById('stepsCurrent').textContent = this.data.steps.toLocaleString();
                document.getElementById('stepsProgress').style.width = `${Math.min((this.data.steps / this.data.stepsGoal) * 100, 100)}%`;

                // Update calories burned
                document.getElementById('caloriesBurned').textContent = this.data.caloriesBurned;
            }

            saveData() {
                localStorage.setItem('healthData', JSON.stringify(this.data));
            }

            // Reset daily data (can be called at midnight)
            resetDailyData() {
                this.data.water = 0;
                this.data.steps = 0;
                this.data.caloriesBurned = 0;
                this.data.sleepStart = null;
                this.data.sleepEnd = null;
                this.data.sleepDuration = 0;
                this.updateDisplay();
                this.saveData();
            }
        }

        new HealthTracker();
    });