let habits = JSON.parse(localStorage.getItem('habits')) || [];

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    
    if (theme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
    } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
    }
}

function updateDateDisplay() {
    const currentDate = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    // Update current date display
    const dateElement = document.querySelector('.current-date');
    dateElement.textContent = currentDate.toLocaleDateString('en-US', options);

    // Generate week days
    const weekDaysElement = document.querySelector('.week-days');
    weekDaysElement.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() - currentDate.getDay() + i);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${date.toDateString() === currentDate.toDateString() ? 'current-day' : ''}`;
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayDate = document.createElement('div');
        dayDate.className = 'day-date';
        dayDate.textContent = date.getDate();

        dayCard.appendChild(dayName);
        dayCard.appendChild(dayDate);
        weekDaysElement.appendChild(dayCard);
    }
}

// Call updateDateDisplay initially
updateDateDisplay();

// Update the date display every minute
setInterval(updateDateDisplay, 60000);

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Add loading state handling
function setLoading(isLoading) {
    const container = document.querySelector('.container');
    if (isLoading) {
        container.classList.add('loading');
    } else {
        container.classList.remove('loading');
    }
}

// Update the addHabit function
async function addHabit() {
    const habitInput = document.getElementById('habitInput');
    const habitName = habitInput.value.trim();

    if (habitName) {
        setLoading(true);
        
        const newHabit = {
            id: Date.now(),
            name: habitName,
            streak: 0,
            lastChecked: null
        };

        habits.push(newHabit);
        await saveHabits();
        displayHabits();
        habitInput.value = '';
        setLoading(false);
    }
}

function checkHabit(id) {
    const habit = habits.find(h => h.id === id);
    const today = new Date().toDateString();

    if (habit.lastChecked !== today) {
        habit.streak += 1;
        habit.lastChecked = today;
        saveHabits();
        displayHabits();
    }
}

function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id);
    saveHabits();
    displayHabits();
}

// Add this function to get a relevant emoji for the habit name
function getHabitEmoji(habitName) {
    const emojiMap = {
        'exercise': '🏃‍♂️',
        'workout': '💪',
        'read': '📚',
        'reading': '📖',
        'meditate': '🧘‍♂️',
        'meditation': '🧘‍♀️',
        'water': '💧',
        'study': '📝',
        'sleep': '😴',
        'walk': '🚶‍♂️',
        'run': '🏃‍♀️',
        'code': '👨‍💻',
        'coding': '💻',
        'programming': '🖥️',
        'yoga': '🧘',
        'gym': '🏋️‍♂️',
        'eat': '🍽️',
        'healthy': '🥗',
        'write': '✍️',
        'journal': '📔',
        'music': '🎵',
        'practice': '🎯',
        'language': '🗣️',
        'draw': '🎨',
        'paint': '🖌️',
        'bike': '🚴‍♂️',
        'swimming': '🏊‍♂️',
        'dance': '💃',
        'pray': '🙏',
        'vitamin': '💊',
        'medicine': '💉',
        'clean': '🧹',
        'cooking': '👨‍🍳',
        'cook': '🍳',
        'budget': '💰',
        'save': '💵',
        'guitar': '🎸',
        'piano': '🎹',
        'sing': '🎤',
    };

    const habitLower = habitName.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (habitLower.includes(key)) {
            return emoji;
        }
    }
    return '✨'; // Default emoji if no match found
}

// Update the displayHabits function
function displayHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';

    habits.forEach(habit => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        
        const emoji = getHabitEmoji(habit.name);
        
        li.innerHTML = `
            <div class="habit-info">
                <div class="habit-name">${emoji} ${habit.name}</div>
                <div class="habit-streak">
                    ${'🔥'.repeat(Math.min(Math.floor(habit.streak/7), 3))} 
                    Current streak: ${habit.streak} days
                </div>
            </div>
            <div class="habit-actions">
                <button class="check-btn" onclick="checkHabit(${habit.id})">✅</button>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">🗑️</button>
            </div>
        `;

        habitsList.appendChild(li);
    });

    updateMonthlyHistory();
}

// Add event listener for Enter key in input field
document.getElementById('habitInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addHabit();
    }
});

// Initial display of habits
displayHabits();

function updateMonthlyHistory() {
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get the first day of the current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay();

    // Get the last day of the current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Create calendar days for the current month only
    for (let dayNumber = 1; dayNumber <= lastDay; dayNumber++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const date = new Date(currentYear, currentMonth, dayNumber);
        const dateString = date.toDateString();
        
        // Check if any habits were completed on this day
        const hasCompletedHabits = habits.some(habit => 
            habit.lastChecked === dateString
        );

        if (hasCompletedHabits) {
            dayDiv.classList.add('completed');
            dayDiv.innerHTML = `
                <span class="date">${dayNumber}</span>
                <span class="completion-emoji">⭐</span>
            `;
        } else {
            dayDiv.innerHTML = `
                <span class="date">${dayNumber}</span>
            `;
        }

        if (dateString === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        calendarGrid.appendChild(dayDiv);
    }

    // Add responsive font sizing for calendar days
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        const size = Math.min(window.innerWidth / 30, 24);
        day.style.fontSize = `${size}px`;
    });
}

// Add this to your initial setup code
updateMonthlyHistory();

// Add touch support for mobile
document.addEventListener('DOMContentLoaded', function() {
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    document.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeDistance = touchEndY - touchStartY;
        if (Math.abs(swipeDistance) > 50) {
            // Implement swipe actions if needed
        }
    }

    // Theme toggle initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
});

// Add window resize handler
window.addEventListener('resize', debounce(function() {
    updateMonthlyHistory();
}, 250));

// Debounce function to prevent excessive updates
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add system theme detection
if (window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    prefersDark.addEventListener('change', (e) => {
        const theme = e.matches ? 'dark' : 'light';
        setTheme(theme);
    });

    // Set initial theme based on system preference if no saved theme
    if (!localStorage.getItem('theme')) {
        const theme = prefersDark.matches ? 'dark' : 'light';
        setTheme(theme);
    }
}
