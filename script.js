 // Theme Toggle Functionality
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

            // Load and display high priority tasks
            loadHighPriorityTasks();
            // Display initial quote
            displayRandomQuote();
        });


        // Greeting and DateTime
        const greetingElement = document.getElementById('greeting');
        const datetimeElement = document.getElementById('datetime');

        function updateGreetingAndDateTime() {
            const now = new Date();
            const hours = now.getHours();
            let greeting;

            if (hours < 12) {
                greeting = "Good Morning! IITian!";
            } else if (hours < 18) {
                greeting = "Good Afternoon!Khana Khaya?";
            } else {
                greeting = "Good Evening!,IITian Ansh";
            }

            greetingElement.textContent = greeting;
            datetimeElement.textContent = now.toLocaleString();
        }

        updateGreetingAndDateTime();
        setInterval(updateGreetingAndDateTime, 1000);


/*weather script*/

        // Weather Functionality (Fixed)
        async function fetchWeather() {
            try {
                // Using a free weather API that doesn't require an  API key like weather.com
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.5941&longitude=85.1376&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature');
                const data = await response.json();
                
                const temp = Math.round(data.current_weather.temperature);
                const weatherCode = data.current_weather.weathercode;
                
                // Weather icon mapping with time
                const weatherIcons = {
                    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
                    45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌦️',
                    61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 81: '🌦️', 82: '🌦️',
                    95: '⛈️', 96: '⛈️', 99: '⛈️'
                };
                
                const weatherDescriptions = {
                    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                    45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
                    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
                    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
                };
                
                document.getElementById("weatherIcon").textContent = weatherIcons[weatherCode] || '🌤️';
                document.getElementById("temperature").textContent = `${temp}°C`;
                document.getElementById("weatherDescription").textContent = weatherDescriptions[weatherCode] || 'Partly cloudy';
                document.getElementById("feelsLike").textContent = `Feels like ${temp}°C`;
                
            } catch (error) {
                console.error('Weather fetch error:', error);
                document.getElementById("weatherIcon").textContent = '🌤️';
                document.getElementById("temperature").textContent = '25°C';
                document.getElementById("weatherDescription").textContent = 'Pleasant weather';
                document.getElementById("feelsLike").textContent = 'Perfect for studying!';
            }
        }
        
        // Load weather on page load
        fetchWeather();
        
        // Refresh weather every 30 minutes
        setInterval(fetchWeather, 30 * 60 * 1000);
        
        // Function to load high priority tasks for Today's Focus
        function loadHighPriorityTasks() {
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed);
            const highPriorityTasksList = document.getElementById('highPriorityTasksList');
            highPriorityTasksList.innerHTML = ''; // Clear previous list

            if (highPriorityTasks.length === 0) {
                highPriorityTasksList.innerHTML = '<li>No high priority tasks for today!</li>';
                return;
            }

            highPriorityTasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="task-content">
                        <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} onclick="completeTaskIndex(${task.id})">
                        <label for="task-${task.id}">${task.title}</label>
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn" onclick="completeTaskIndex(${task.id})">✓</button>
                        <button class="delete-btn" onclick="deleteTaskIndex(${task.id})">🗑️</button>
                    </div>
                `;
                highPriorityTasksList.appendChild(li);
            });
        }

        // Function to mark a task as complete from index.html
        function completeTaskIndex(taskId) {
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedAt = new Date().toISOString();
                localStorage.setItem('tasks', JSON.stringify(tasks));
                loadHighPriorityTasks();
                 
                if (window.opener && typeof window.opener.taskManager !== 'undefined') {
                    window.opener.taskManager.renderTasks();
                    window.opener.taskManager.updateStatistics();
                }
            }
        }

        // Function to delete a task from index.html
        function deleteTaskIndex(taskId) {
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks = tasks.filter(t => t.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadHighPriorityTasks(); // Re-render the list
            // Optionally, notify todo.html to update its view if it's open
            if (window.opener && typeof window.opener.taskManager !== 'undefined') {
                window.opener.taskManager.renderTasks();
                window.opener.taskManager.updateStatistics();
            }
        }

        // Motivational Quotes Functionality
        const quotes = [
            "The best way to predict the future is to create it.",
            "Your time is limited, don't waste it living someone else's life.",
            "The only way to do great work is to love what you do.",
            "Believe you can and you're halfway there.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It always seems impossible until it's done.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The mind is everything. What you think you become.",
            "Strive not to be a success, but rather to be of value.",
            "The secret of getting ahead is getting started."
        ];

        const quoteTextElement = document.querySelector('#quote-text p');
        const nextQuoteBtn = document.getElementById('next-quote-btn');
        let currentQuoteIndex = 0; // To cycle through quotes, or use random for truly random

        function displayRandomQuote() {
            // Option 1: Display a random quote
            const randomIndex = Math.floor(Math.random() * quotes.length);
            quoteTextElement.textContent = quotes[randomIndex];

            // Option 2: Cycle through quotes (uncomment below and comment out Option 1)
            // quoteTextElement.textContent = quotes[currentQuoteIndex];
            // currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        }

        // Event listener for the "Next Quote" button
        nextQuoteBtn.addEventListener('click', displayRandomQuote);
        // Initial quote display