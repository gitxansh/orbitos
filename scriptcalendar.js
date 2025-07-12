   // Calendar Application
        class CalendarApp {
            constructor() {
                this.currentDate = new Date();
                this.selectedDate = null;
                this.events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
                this.viewMode = 'month'; // 'month' or 'week'
                this.eventChart = null; // To store the Chart.js instance
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.renderAll(); // Renders calendar, upcoming events, and updates analytics
                this.initializeChart();
                this.loadTheme();
            }

            setupEventListeners() {
                document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
                document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
                document.getElementById('eventForm').addEventListener('submit', (e) => this.handleEventSubmit(e));
                document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());
                
                // Close modal when clicking outside
                document.getElementById('eventModal').addEventListener('click', (e) => {
                    if (e.target.id === 'eventModal') {
                        this.closeEventModal();
                    }
                });
            }

            // --- Calendar Rendering ---
            renderAll() {
                this.renderCalendar();
                this.renderUpcomingEvents();
                this.updateAnalytics();
                this.updateChart();
            }

            renderCalendar() {
                const calendarGrid = document.getElementById('calendarGrid');
                const currentMonthDisplay = document.getElementById('currentMonth');
                const weeklyView = document.getElementById('weeklyView');
                const mainCalendarContainer = document.querySelector('.calendar-container');

                if (this.viewMode === 'week') {
                    mainCalendarContainer.style.display = 'none';
                    weeklyView.style.display = 'grid';
                    this.renderWeekView();
                    return;
                } else {
                    mainCalendarContainer.style.display = 'block';
                    weeklyView.style.display = 'none';
                }
                
                currentMonthDisplay.textContent = this.currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                });

                calendarGrid.innerHTML = '';

                const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dayHeaders.forEach(day => {
                    const dayHeader = document.createElement('div');
                    dayHeader.className = 'calendar-day-header';
                    dayHeader.textContent = day;
                    calendarGrid.appendChild(dayHeader);
                });

                const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
                const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDayOfWeek = firstDay.getDay();

                for (let i = 0; i < startingDayOfWeek; i++) {
                    const emptyDay = document.createElement('div');
                    emptyDay.className = 'calendar-day other-month';
                    calendarGrid.appendChild(emptyDay);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const dayElement = document.createElement('div');
                    dayElement.className = 'calendar-day';
                    
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'day-number';
                    dayNumber.textContent = day;
                    dayElement.appendChild(dayNumber);

                    const today = new Date();
                    if (this.currentDate.getMonth() === today.getMonth() &&
                        this.currentDate.getFullYear() === today.getFullYear() &&
                        day === today.getDate()) {
                        dayElement.classList.add('today');
                    }

                    const currentDayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                    const dayEvents = this.getEventsForDate(currentDayDate);
                    
                    if (dayEvents.length > 0) {
                        const eventDotsContainer = document.createElement('div');
                        eventDotsContainer.className = 'event-dots-container';
                        dayEvents.forEach(event => {
                            const eventDot = document.createElement('div');
                            eventDot.className = `event-dot ${event.priority}`;
                            eventDot.title = event.title;
                            eventDotsContainer.appendChild(eventDot);
                        });
                        dayElement.appendChild(eventDotsContainer);
                    }

                    dayElement.addEventListener('click', () => this.showEventsForDay(currentDayDate));
                    
                    calendarGrid.appendChild(dayElement);
                }
            }

            renderWeekView() {
                const weeklyView = document.getElementById('weeklyView');
                weeklyView.innerHTML = '';

                // Get start of week (Sunday) from the current date
                const startOfWeek = new Date(this.currentDate);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0,0,0,0); // Reset time to start of day

                for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(day.getDate() + i);

                    const dayElement = document.createElement('div');
                    dayElement.className = 'week-day';

                    const dayHeader = document.createElement('div');
                    dayHeader.className = 'week-day-header';
                    dayHeader.textContent = day.toLocaleDateString('en-US', { weekday: 'short' });

                    const dayDate = document.createElement('div');
                    dayDate.className = 'week-day-date';
                    dayDate.textContent = day.getDate();

                    const dayEvents = this.getEventsForDate(day);
                    const eventsText = document.createElement('div');
                    eventsText.className = 'week-day-events';
                    eventsText.textContent = `${dayEvents.length} events`;

                    dayElement.appendChild(dayHeader);
                    dayElement.appendChild(dayDate);
                    dayElement.appendChild(eventsText);
                    dayElement.addEventListener('click', () => this.showEventsForDay(day));
                    weeklyView.appendChild(dayElement);
                }
            }

            getEventsForDate(date) {
                // Ensure the comparison ignores time components
                return this.events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.toDateString() === date.toDateString();
                });
            }

            previousMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderAll();
            }

            nextMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderAll();
            }

            // --- Event Management ---
            handleEventSubmit(e) {
                e.preventDefault();
                const title = document.getElementById('eventTitle').value;
                const description = document.getElementById('eventDescription').value;
                const date = document.getElementById('eventDate').value;
                const time = document.getElementById('eventTime').value;
                const type = document.getElementById('eventType').value;
                const priority = document.getElementById('eventPriority').value;

                if (!title || !date || !time) {
                    alert('Please fill in all required event fields.');
                    return;
                }

                const newEvent = {
                    id: Date.now(), // Simple unique ID
                    title,
                    description,
                    date,
                    time,
                    type,
                    priority
                };

                this.events.push(newEvent);
                this.saveEvents();
                document.getElementById('eventForm').reset();
                this.renderAll();
                alert('Event added successfully!');
            }

            saveEvents() {
                localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            }

            renderUpcomingEvents() {
                const upcomingEventsList = document.getElementById('upcomingEventsList');
                upcomingEventsList.innerHTML = '';

                const now = new Date();
                const upcoming = this.events.filter(event => {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    return eventDateTime >= now;
                }).sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time}`);
                    const dateB = new Date(`${b.date}T${b.time}`);
                    return dateA - dateB;
                });

                if (upcoming.length === 0) {
                    upcomingEventsList.innerHTML = '<p>No upcoming events.</p>';
                    return;
                }

                upcoming.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'event-item';
                    
                    let priorityColor = '#4f46e5'; // Default blue
                    if (event.priority === 'high') priorityColor = '#ef4444'; // Red
                    else if (event.priority === 'medium') priorityColor = '#f59e0b'; // Amber
                    else if (event.priority === 'low') priorityColor = '#10b981'; // Green

                    eventItem.style.borderLeftColor = priorityColor;

                    eventItem.innerHTML = `
                        <button class="delete-event-btn" data-id="${event.id}">&times;</button>
                        <div class="event-title">${event.title}</div>
                        <div class="event-time">${new Date(`${event.date}T${event.time}`).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                        <div class="event-type">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
                        ${event.description ? `<p style="font-size: 0.9rem; color: #6b7280; margin-top: 0.5rem;">${event.description}</p>` : ''}
                    `;
                    upcomingEventsList.appendChild(eventItem);
                });

                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-event-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const eventId = parseInt(e.target.dataset.id);
                        this.deleteEvent(eventId);
                    });
                });
            }

            deleteEvent(id) {
                if (confirm('Are you sure you want to delete this event?')) {
                    this.events = this.events.filter(event => event.id !== id);
                    this.saveEvents();
                    this.renderAll();
                    alert('Event deleted successfully!');
                    this.closeEventModal(); // Close modal if open
                }
            }

            // --- Modals and Views ---
            openEventModal(event = null) {
                const modal = document.getElementById('eventModal');
                const eventDetails = document.getElementById('eventDetails');
                eventDetails.innerHTML = ''; // Clear previous details

                if (event) {
                    eventDetails.innerHTML = `
                        <p><strong>Title:</strong> ${event.title}</p>
                        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${event.time}</p>
                        <p><strong>Type:</strong> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                        <p><strong>Priority:</strong> ${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}</p>
                        ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                        <button class="action-btn" onclick="app.deleteEvent(${event.id})" style="background-color: #dc2626; margin-top: 1rem;">Delete Event</button>
                    `;
                    document.querySelector('.modal-title').textContent = 'Event Details';
                } else {
                    // Optionally, you could use this modal for adding events if you prefer
                    // For now, the add form is directly on the page.
                    eventDetails.innerHTML = '<p>No event selected. Click on a calendar day to see its events.</p>';
                    document.querySelector('.modal-title').textContent = 'Event Details';
                }
                modal.classList.add('active');
            }

            showEventsForDay(date) {
                const dayEvents = this.getEventsForDate(date);
                const eventDetails = document.getElementById('eventDetails');
                eventDetails.innerHTML = `<h4>Events for ${date.toLocaleDateString('en-US', { dateStyle: 'full' })}</h4>`;

                if (dayEvents.length === 0) {
                    eventDetails.innerHTML += '<p>No events scheduled for this day.</p>';
                } else {
                    dayEvents.forEach(event => {
                        eventDetails.innerHTML += `
                            <div class="event-item" style="border-left-color: ${
                                event.priority === 'high' ? '#ef4444' :
                                event.priority === 'medium' ? '#f59e0b' : '#10b981'
                            }; margin-bottom: 0.5rem; padding: 0.8rem;">
                                <button class="delete-event-btn" data-id="${event.id}" style="top: 5px; right: 5px;">&times;</button>
                                <strong>${event.title}</strong><br>
                                <small>${event.time} - ${event.type.charAt(0).toUpperCase() + event.type.slice(1)} (${event.priority})</small>
                                ${event.description ? `<p style="font-size: 0.8rem; margin-top: 0.3rem;">${event.description}</p>` : ''}
                            </div>
                        `;
                    });
                }
                document.getElementById('eventModal').classList.add('active');

                // Re-add event listeners for delete buttons in modal
                document.querySelectorAll('#eventDetails .delete-event-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const eventId = parseInt(e.target.dataset.id);
                        this.deleteEvent(eventId);
                    });
                });
            }


            closeEventModal() {
                document.getElementById('eventModal').classList.remove('active');
            }

            toggleWeekView() {
                this.viewMode = this.viewMode === 'month' ? 'week' : 'month';
                document.querySelector('.action-btn.secondary').textContent = 
                    this.viewMode === 'month' ? '📊 Toggle Weekly View' : '📅 Toggle Monthly View';
                this.renderAll();
            }

            exportCalendar() {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.events, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "calendar_events.json");
                document.body.appendChild(downloadAnchorNode); // Required for Firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                alert('Calendar events exported as calendar_events.json');
            }

            // --- Analytics ---
            updateAnalytics() {
                const totalEvents = this.events.length;
                document.getElementById('totalEvents').textContent = totalEvents;

                const now = new Date();
                now.setHours(0,0,0,0);

                // This week events
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
                endOfWeek.setHours(23,59,59,999);

                const thisWeekEvents = this.events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= startOfWeek && eventDate <= endOfWeek;
                }).length;
                document.getElementById('thisWeekEvents').textContent = thisWeekEvents;

                // Upcoming events (already handled in renderUpcomingEvents, but for consistency)
                const upcomingEventsCount = this.events.filter(event => {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    return eventDateTime >= new Date();
                }).length;
                document.getElementById('upcomingEvents').textContent = upcomingEventsCount;

                // Overdue tasks
                const overdueTasks = this.events.filter(event => {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    return eventDateTime < new Date() && event.type === 'deadline'; // Assuming deadlines are "tasks"
                }).length;
                document.getElementById('overdueTasks').textContent = overdueTasks;
            }

            initializeChart() {
                const ctx = document.getElementById('eventChart').getContext('2d');
                this.eventChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: [],
                            borderColor: [],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: document.body.dataset.theme === 'dark' ? '#e2e8f0' : '#333'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Events by Type',
                                color: document.body.dataset.theme === 'dark' ? '#60a5fa' : '#1e3a8a'
                            }
                        }
                    }
                });
                this.updateChart();
            }

            updateChart() {
                if (!this.eventChart) return;

                const eventTypeCounts = this.events.reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {});

                const labels = Object.keys(eventTypeCounts);
                const data = Object.values(eventTypeCounts);

                const backgroundColors = {
                    'meeting': '#4f46e5',    // Indigo
                    'appointment': '#f59e0b', // Amber
                    'deadline': '#ef4444',   // Red
                    'personal': '#10b981',   // Emerald
                    'reminder': '#8b5cf6'    // Violet
                };
                const borderColors = {
                    'meeting': '#3730a3',
                    'appointment': '#b45309',
                    'deadline': '#dc2626',
                    'personal': '#059669',
                    'reminder': '#6d28d9'
                };

                const chartBackgroundColors = labels.map(label => backgroundColors[label]);
                const chartBorderColors = labels.map(label => borderColors[label]);

                this.eventChart.data.labels = labels;
                this.eventChart.data.datasets[0].data = data;
                this.eventChart.data.datasets[0].backgroundColor = chartBackgroundColors;
                this.eventChart.data.datasets[0].borderColor = chartBorderColors;

                // Update chart title and legend color based on theme
                this.eventChart.options.plugins.title.color = document.body.dataset.theme === 'dark' ? '#60a5fa' : '#1e3a8a';
                this.eventChart.options.plugins.legend.labels.color = document.body.dataset.theme === 'dark' ? '#e2e8f0' : '#333';
                
                this.eventChart.update();
            }

            showAnalytics() {
                // This function currently just updates analytics and chart, 
                // as the panel is always visible. If it were a modal,
                // this would open it.
                this.updateAnalytics();
                this.updateChart();
                alert('Analytics updated!');
            }

            // --- Theme Toggling ---
            toggleTheme() {
                const body = document.body;
                if (body.dataset.theme === 'dark') {
                    body.dataset.theme = 'light';
                    localStorage.setItem('theme', 'light');
                } else {
                    body.dataset.theme = 'dark';
                    localStorage.setItem('theme', 'dark');
                }
                this.updateChart(); // Update chart colors on theme change
            }

            loadTheme() {
                const savedTheme = localStorage.getItem('theme') || 'light';
                document.body.dataset.theme = savedTheme;
            }
        }

        // Initialize the Calendar App
        const app = new CalendarApp();
