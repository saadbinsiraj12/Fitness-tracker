document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userInfoForm = document.getElementById('userInfoForm');
    const dashboard = document.querySelector('.dashboard');
    const userGreeting = document.getElementById('userGreeting');
    const userAvatar = document.getElementById('userAvatar');
    const dailyQuote = document.getElementById('dailyQuote');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const caloriesValue = document.getElementById('caloriesValue');
    const waterValue = document.getElementById('waterValue');
    const todaysPlanItems = document.getElementById('todaysPlanItems');
    const workoutPlan = document.getElementById('workoutPlan');
    const proteinAmount = document.getElementById('proteinAmount');
    const carbsAmount = document.getElementById('carbsAmount');
    const fatAmount = document.getElementById('fatAmount');
    const mealPlan = document.getElementById('mealPlan');
    const dailyRoutine = document.getElementById('dailyRoutine');
    const progressForm = document.getElementById('progressForm');
    
    // Motivational Quotes
    const quotes = [
        "The only bad workout is the one that didn't happen.",
        "Success starts with self-discipline.",
        "Your body hears everything your mind says. Stay positive!",
        "Don't stop when you're tired. Stop when you're done.",
        "The secret of getting ahead is getting started.",
        "Discipline is choosing between what you want now and what you want most.",
        "You don't have to be extreme, just consistent.",
        "Small steps every day lead to big results.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Healthy is an outfit that looks different on everybody."
    ];
    
    // User Data
    let userData = JSON.parse(localStorage.getItem('userData')) || null;
    let progressData = JSON.parse(localStorage.getItem('progressData')) || [];
    
    // Initialize the app
    initApp();
    
    function initApp() {
        // Show random quote
        showRandomQuote();
        
        // If user data exists, show dashboard
        if (userData) {
            showDashboard();
        }
        
        // Event listeners
        if (userInfoForm) {
            userInfoForm.addEventListener('submit', handleUserInfoSubmit);
        }
        
        // Navigation
        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                showSection(targetId);
                
                // Update active nav item
                document.querySelectorAll('.sidebar nav li').forEach(item => {
                    item.classList.remove('active');
                });
                this.parentElement.classList.add('active');
            });
        });
        
        // Workout day toggle
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('workout-day-header') || 
                e.target.closest('.workout-day-header')) {
                const header = e.target.classList.contains('workout-day-header') ? 
                    e.target : e.target.closest('.workout-day-header');
                header.classList.toggle('collapsed');
            }
        });
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                localStorage.removeItem('userData');
                localStorage.removeItem('progressData');
                location.reload();
            });
        }
        
        // Progress form submission
        if (progressForm) {
            progressForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProgress();
            });
        }
    }
    
    function showRandomQuote() {
        if (dailyQuote) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            dailyQuote.textContent = randomQuote;
        }
    }
    
    function handleUserInfoSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const height = parseInt(document.getElementById('height').value);
        const weight = parseInt(document.getElementById('weight').value);
        const activity = document.getElementById('activity').value;
        const goal = document.getElementById('goal').value;
        
        // Save user data
        userData = {
            name,
            age,
            gender,
            height,
            weight,
            activity,
            goal
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show dashboard
        showDashboard();
    }
    
    function showDashboard() {
        // Hide form, show dashboard
        document.querySelector('.user-info-form').classList.remove('active');
        dashboard.classList.add('active');
        
        // Update user greeting
        updateUserGreeting();
        
        // Calculate and display stats
        calculateAndDisplayStats();
        
        // Generate and display plans
        generateAndDisplayPlans();
        
        // Show overview section by default
        showSection('overview');
    }
    
    function updateUserGreeting() {
        if (userGreeting && userData) {
            const now = new Date();
            const hours = now.getHours();
            let greeting;
            
            if (hours < 12) {
                greeting = 'Good morning';
            } else if (hours < 18) {
                greeting = 'Good afternoon';
            } else {
                greeting = 'Good evening';
            }
            
            userGreeting.textContent = `${greeting}, ${userData.name.split(' ')[0]}`;
        }
        
        // Set random avatar color
        if (userAvatar) {
            const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#0984e3'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            userAvatar.style.backgroundColor = randomColor;
            userAvatar.textContent = userData.name.charAt(0).toUpperCase();
        }
    }
    
    function calculateAndDisplayStats() {
        if (!userData) return;
        
        // Calculate BMI
        const heightInMeters = userData.height / 100;
        const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        let bmiCategoryText;
        if (bmi < 18.5) {
            bmiCategoryText = 'Underweight';
        } else if (bmi < 25) {
            bmiCategoryText = 'Normal weight';
        } else if (bmi < 30) {
            bmiCategoryText = 'Overweight';
        } else {
            bmiCategoryText = 'Obese';
        }
        
        if (bmiValue) bmiValue.textContent = bmi;
        if (bmiCategory) bmiCategory.textContent = bmiCategoryText;
        
        // Calculate daily calories (Mifflin-St Jeor Equation)
        let bmr;
        if (userData.gender === 'male') {
            bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
        } else {
            bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
        }
        
        let activityFactor;
        switch (userData.activity) {
            case 'sedentary': activityFactor = 1.2; break;
            case 'light': activityFactor = 1.375; break;
            case 'moderate': activityFactor = 1.55; break;
            case 'active': activityFactor = 1.725; break;
            case 'very-active': activityFactor = 1.9; break;
            default: activityFactor = 1.2;
        }
        
        let maintenanceCalories = Math.round(bmr * activityFactor);
        let goalCalories = maintenanceCalories;
        
        // Adjust for goal
        switch (userData.goal) {
            case 'weight-loss': goalCalories = maintenanceCalories - 500; break;
            case 'muscle-gain': goalCalories = maintenanceCalories + 300; break;
        }
        
        if (caloriesValue) caloriesValue.textContent = goalCalories;
        
        // Calculate water intake
        const waterIntake = Math.round((userData.weight * 0.033) * 10) / 10;
        if (waterValue) waterValue.textContent = waterIntake;
        
        // Update macros
        updateMacros(goalCalories);
    }
    
    function updateMacros(calories) {
        let proteinG, carbsG, fatG;
        
        switch (userData.goal) {
            case 'weight-loss':
                proteinG = Math.round(userData.weight * 2.2);
                fatG = Math.round((calories * 0.25) / 9);
                carbsG = Math.round((calories - (proteinG * 4) - (fatG * 9)) / 4);
                break;
            case 'muscle-gain':
                proteinG = Math.round(userData.weight * 2.5);
                fatG = Math.round((calories * 0.25) / 9);
                carbsG = Math.round((calories - (proteinG * 4) - (fatG * 9)) / 4);
                break;
            default:
                proteinG = Math.round(userData.weight * 1.8);
                fatG = Math.round((calories * 0.25) / 9);
                carbsG = Math.round((calories - (proteinG * 4) - (fatG * 9)) / 4);
        }
        
        if (proteinAmount) proteinAmount.textContent = `${proteinG}g`;
        if (carbsAmount) carbsAmount.textContent = `${carbsG}g`;
        if (fatAmount) fatAmount.textContent = `${fatG}g`;
    }
    
    function generateAndDisplayPlans() {
        generateTodaysPlan();
        generateWorkoutPlan();
        generateMealPlan();
        generateDailyRoutine();
        initializeCharts();
    }
    
    function generateTodaysPlan() {
        if (!todaysPlanItems) return;
        
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        let workoutType;
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            workoutType = 'Rest Day';
        } else if (dayOfWeek % 2 === 1) {
            workoutType = 'Upper Body';
        } else {
            workoutType = 'Lower Body';
        }
        
        const planItems = [
            {
                icon: 'fas fa-glass-water',
                title: 'Water Intake',
                description: `Drink at least ${waterValue.textContent}L of water today`
            },
            {
                icon: 'fas fa-dumbbell',
                title: 'Workout',
                description: workoutType === 'Rest Day' ? 
                    'Active recovery or rest day' : 
                    `${workoutType} workout (45-60 minutes)`
            },
            {
                icon: 'fas fa-utensils',
                title: 'Nutrition',
                description: 'Follow your meal plan and stay within your macros'
            },
            {
                icon: 'fas fa-moon',
                title: 'Sleep',
                description: 'Aim for 7-9 hours of quality sleep'
            }
        ];
        
        todaysPlanItems.innerHTML = '';
        planItems.forEach(item => {
            const planItem = document.createElement('div');
            planItem.className = 'plan-item';
            planItem.innerHTML = `
                <i class="${item.icon}"></i>
                <div class="plan-item-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            planItem.style.animation = `fadeIn 0.5s ease-out ${planItems.indexOf(item) * 0.1}s both`;
            todaysPlanItems.appendChild(planItem);
        });
    }
    
    function generateWorkoutPlan() {
        if (!workoutPlan) return;
        
        const workoutDays = [
            {
                day: 'Monday',
                type: 'Upper Body',
                exercises: [
                    {
                        category: 'Warm-up',
                        items: [
                            { name: 'Arm Circles', sets: '2 sets of 30 seconds' },
                            { name: 'Shoulder Rolls', sets: '2 sets of 30 seconds' },
                            { name: 'Jumping Jacks', sets: '2 sets of 30 seconds' }
                        ]
                    },
                    {
                        category: 'Strength Training',
                        items: [
                            { name: 'Push-ups', sets: '3 sets of 10-15 reps' },
                            { name: 'Dumbbell Shoulder Press', sets: '3 sets of 8-12 reps' },
                            { name: 'Bent-over Rows', sets: '3 sets of 8-12 reps' },
                            { name: 'Bicep Curls', sets: '3 sets of 10-12 reps' },
                            { name: 'Tricep Dips', sets: '3 sets of 10-15 reps' }
                        ]
                    },
                    {
                        category: 'Cool Down',
                        items: [
                            { name: 'Shoulder Stretch', sets: '30 seconds each side' },
                            { name: 'Arm Across Chest Stretch', sets: '30 seconds each side' }
                        ]
                    }
                ]
            },
            {
                day: 'Tuesday',
                type: 'Lower Body',
                exercises: [
                    {
                        category: 'Warm-up',
                        items: [
                            { name: 'Leg Swings', sets: '2 sets of 10 each leg' },
                            { name: 'Bodyweight Squats', sets: '2 sets of 10 reps' },
                            { name: 'High Knees', sets: '2 sets of 30 seconds' }
                        ]
                    },
                    {
                        category: 'Strength Training',
                        items: [
                            { name: 'Squats', sets: '4 sets of 8-12 reps' },
                            { name: 'Lunges', sets: '3 sets of 10 reps each leg' },
                            { name: 'Deadlifts', sets: '3 sets of 8-10 reps' },
                            { name: 'Calf Raises', sets: '3 sets of 15-20 reps' },
                            { name: 'Glute Bridges', sets: '3 sets of 12-15 reps' }
                        ]
                    },
                    {
                        category: 'Cool Down',
                        items: [
                            { name: 'Quad Stretch', sets: '30 seconds each side' },
                            { name: 'Hamstring Stretch', sets: '30 seconds each side' }
                        ]
                    }
                ]
            },
            {
                day: 'Wednesday',
                type: 'Core & Cardio',
                exercises: [
                    {
                        category: 'Warm-up',
                        items: [
                            { name: 'Jump Rope', sets: '2 sets of 30 seconds' },
                            { name: 'Arm Circles', sets: '2 sets of 30 seconds' },
                            { name: 'Torso Twists', sets: '2 sets of 30 seconds' }
                        ]
                    },
                    {
                        category: 'Core Training',
                        items: [
                            { name: 'Plank', sets: '3 sets of 30-60 seconds' },
                            { name: 'Russian Twists', sets: '3 sets of 15 reps each side' },
                            { name: 'Leg Raises', sets: '3 sets of 12-15 reps' },
                            { name: 'Bicycle Crunches', sets: '3 sets of 20 reps' }
                        ]
                    },
                    {
                        category: 'Cardio',
                        items: [
                            { name: 'Running/Jogging', sets: '20-30 minutes' },
                            { name: 'Jump Rope', sets: '5 sets of 1 minute' }
                        ]
                    },
                    {
                        category: 'Cool Down',
                        items: [
                            { name: 'Seated Forward Bend', sets: '30 seconds' },
                            { name: 'Child\'s Pose', sets: '30 seconds' }
                        ]
                    }
                ]
            },
            {
                day: 'Thursday',
                type: 'Upper Body',
                exercises: [
                    {
                        category: 'Warm-up',
                        items: [
                            { name: 'Arm Circles', sets: '2 sets of 30 seconds' },
                            { name: 'Shoulder Rolls', sets: '2 sets of 30 seconds' },
                            { name: 'Jumping Jacks', sets: '2 sets of 30 seconds' }
                        ]
                    },
                    {
                        category: 'Strength Training',
                        items: [
                            { name: 'Pull-ups or Lat Pulldowns', sets: '3 sets of 8-12 reps' },
                            { name: 'Bench Press', sets: '3 sets of 8-12 reps' },
                            { name: 'Lateral Raises', sets: '3 sets of 10-12 reps' },
                            { name: 'Hammer Curls', sets: '3 sets of 10-12 reps' },
                            { name: 'Skull Crushers', sets: '3 sets of 10-12 reps' }
                        ]
                    },
                    {
                        category: 'Cool Down',
                        items: [
                            { name: 'Shoulder Stretch', sets: '30 seconds each side' },
                            { name: 'Arm Across Chest Stretch', sets: '30 seconds each side' }
                        ]
                    }
                ]
            },
            {
                day: 'Friday',
                type: 'Lower Body',
                exercises: [
                    {
                        category: 'Warm-up',
                        items: [
                            { name: 'Leg Swings', sets: '2 sets of 10 each leg' },
                            { name: 'Bodyweight Squats', sets: '2 sets of 10 reps' },
                            { name: 'High Knees', sets: '2 sets of 30 seconds' }
                        ]
                    },
                    {
                        category: 'Strength Training',
                        items: [
                            { name: 'Bulgarian Split Squats', sets: '3 sets of 8-10 reps each leg' },
                            { name: 'Romanian Deadlifts', sets: '3 sets of 8-10 reps' },
                            { name: 'Step-ups', sets: '3 sets of 10 reps each leg' },
                            { name: 'Seated Calf Raises', sets: '3 sets of 15-20 reps' },
                            { name: 'Hip Thrusts', sets: '3 sets of 12-15 reps' }
                        ]
                    },
                    {
                        category: 'Cool Down',
                        items: [
                            { name: 'Quad Stretch', sets: '30 seconds each side' },
                            { name: 'Hamstring Stretch', sets: '30 seconds each side' }
                        ]
                    }
                ]
            },
            {
                day: 'Saturday',
                type: 'Active Recovery',
                exercises: [
                    {
                        category: 'Activities',
                        items: [
                            { name: 'Yoga or Stretching', sets: '30-45 minutes' },
                            { name: 'Walking or Light Cycling', sets: '30-60 minutes' },
                            { name: 'Foam Rolling', sets: '10-15 minutes' }
                        ]
                    }
                ]
            },
            {
                day: 'Sunday',
                type: 'Rest Day',
                exercises: [
                    {
                        category: 'Recommendations',
                        items: [
                            { name: 'Complete Rest', sets: '' },
                            { name: 'Light Walking', sets: 'Optional' },
                            { name: 'Stretching', sets: 'Optional' }
                        ]
                    }
                ]
            }
        ];
        
        workoutPlan.innerHTML = '';
        workoutDays.forEach(day => {
            const workoutDay = document.createElement('div');
            workoutDay.className = 'workout-day';
            
            const workoutDayHeader = document.createElement('div');
            workoutDayHeader.className = 'workout-day-header';
            workoutDayHeader.innerHTML = `
                <h3><i class="fas fa-calendar-day"></i> ${day.day} - ${day.type}</h3>
                <span class="toggle"><i class="fas fa-chevron-down"></i></span>
            `;
            
            const workoutDayContent = document.createElement('div');
            workoutDayContent.className = 'workout-day-content';
            
            day.exercises.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'workout-category';
                
                const categoryHeader = document.createElement('h4');
                categoryHeader.innerHTML = `<i class="fas fa-${category.category === 'Warm-up' ? 'fire' : 
                                          category.category === 'Cool Down' ? 'wind' : 
                                          category.category === 'Cardio' ? 'heartbeat' : 'dumbbell'}"></i> ${category.category}`;
                
                const exercisesDiv = document.createElement('div');
                exercisesDiv.className = 'workout-exercises';
                
                category.items.forEach(exercise => {
                    const exerciseDiv = document.createElement('div');
                    exerciseDiv.className = 'exercise';
                    exerciseDiv.innerHTML = `
                        <div class="exercise-icon">
                            <i class="fas fa-${exercise.name.includes('Stretch') ? 'spa' : 
                                            exercise.name.includes('Run') ? 'running' : 
                                            exercise.name.includes('Jump') ? 'redo' : 
                                            exercise.name.includes('Plank') ? 'shield-alt' : 
                                            'dumbbell'}"></i>
                        </div>
                        <div class="exercise-content">
                            <h5>${exercise.name}</h5>
                            <p>${exercise.sets}</p>
                        </div>
                    `;
                    exercisesDiv.appendChild(exerciseDiv);
                });
                
                categoryDiv.appendChild(categoryHeader);
                categoryDiv.appendChild(exercisesDiv);
                workoutDayContent.appendChild(categoryDiv);
            });
            
            workoutDay.appendChild(workoutDayHeader);
            workoutDay.appendChild(workoutDayContent);
            workoutPlan.appendChild(workoutDay);
            
            // Add animation delay
            workoutDay.style.animation = `fadeIn 0.5s ease-out ${workoutDays.indexOf(day) * 0.1}s both`;
        });
    }
    
    function generateMealPlan() {
        if (!mealPlan) return;
        
        const meals = [
            {
                name: 'Breakfast',
                items: [
                    { name: 'Oatmeal with berries and nuts', calories: 350 },
                    { name: 'Scrambled eggs with spinach', calories: 300 },
                    { name: 'Green tea or black coffee', calories: 5 }
                ]
            },
            {
                name: 'Mid-Morning Snack',
                items: [
                    { name: 'Greek yogurt with honey', calories: 200 },
                    { name: 'Handful of almonds', calories: 160 }
                ]
            },
            {
                name: 'Lunch',
                items: [
                    { name: 'Grilled chicken breast', calories: 250 },
                    { name: 'Quinoa or brown rice', calories: 200 },
                    { name: 'Steamed vegetables', calories: 100 },
                    { name: 'Salad with olive oil dressing', calories: 150 }
                ]
            },
            {
                name: 'Afternoon Snack',
                items: [
                    { name: 'Protein shake', calories: 200 },
                    { name: 'Apple with peanut butter', calories: 200 }
                ]
            },
            {
                name: 'Dinner',
                items: [
                    { name: 'Grilled salmon or tofu', calories: 300 },
                    { name: 'Sweet potato', calories: 150 },
                    { name: 'Roasted vegetables', calories: 120 },
                    { name: 'Avocado salad', calories: 180 }
                ]
            },
            {
                name: 'Evening Snack (Optional)',
                items: [
                    { name: 'Cottage cheese', calories: 150 },
                    { name: 'Dark chocolate (1 square)', calories: 50 }
                ]
            }
        ];
        
        mealPlan.innerHTML = '';
        meals.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.className = 'meal';
            
            const mealHeader = document.createElement('div');
            mealHeader.className = 'meal-header';
            mealHeader.innerHTML = `<h4><i class="fas fa-${meal.name.includes('Breakfast') ? 'sun' : 
                                   meal.name.includes('Lunch') ? 'sun' : 
                                   meal.name.includes('Dinner') ? 'moon' : 'clock'}"></i> ${meal.name}</h4>`;
            
            const mealContent = document.createElement('div');
            mealContent.className = 'meal-content';
            
            meal.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'meal-item';
                itemDiv.innerHTML = `
                    <span class="meal-item-name">${item.name}</span>
                    <span class="meal-item-calories">${item.calories} kcal</span>
                `;
                mealContent.appendChild(itemDiv);
            });
            
            mealDiv.appendChild(mealHeader);
            mealDiv.appendChild(mealContent);
            mealPlan.appendChild(mealDiv);
            
            // Add animation delay
            mealDiv.style.animation = `fadeIn 0.5s ease-out ${meals.indexOf(meal) * 0.1}s both`;
        });
    }
    
    function generateDailyRoutine() {
        if (!dailyRoutine) return;
        
        const routine = [
            { time: '6:30', title: 'Wake Up', description: 'Start your day with a glass of water' },
            { time: '6:45', title: 'Morning Exercise', description: 'Light stretching or yoga' },
            { time: '7:15', title: 'Breakfast', description: 'Fuel your body with a nutritious meal' },
            { time: '8:00', title: 'Work/Study', description: 'Focus on your tasks for the day' },
            { time: '10:00', title: 'Morning Snack', description: 'Healthy snack to keep energy levels up' },
            { time: '12:30', title: 'Lunch', description: 'Balanced meal with protein, carbs, and veggies' },
            { time: '13:00', title: 'Short Walk', description: '10-15 minute walk after lunch' },
            { time: '15:00', title: 'Afternoon Snack', description: 'Protein-rich snack to avoid energy crash' },
            { time: '18:00', title: 'Workout', description: 'Follow your workout plan' },
            { time: '19:00', title: 'Dinner', description: 'Light but nutritious meal' },
            { time: '20:00', title: 'Relaxation', description: 'Read, meditate, or enjoy a hobby' },
            { time: '22:00', title: 'Prepare for Sleep', description: 'Turn off screens, dim lights' },
            { time: '22:30', title: 'Bedtime', description: 'Aim for 7-9 hours of quality sleep' }
        ];
        
        dailyRoutine.innerHTML = '';
        routine.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'routine-item';
            itemDiv.innerHTML = `
                <div class="routine-time">${item.time}</div>
                <div class="routine-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            itemDiv.style.animation = `slideUp 0.5s ease-out ${routine.indexOf(item) * 0.1}s both`;
            dailyRoutine.appendChild(itemDiv);
        });
    }
    
    function initializeCharts() {
        // Weight Chart
        const weightCtx = document.getElementById('weightChart').getContext('2d');
        
        // Sample data - in a real app, this would come from user progress data
        const labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const weightData = labels.map(() => {
            return userData.weight + (Math.random() * 2 - 1);
        });
        
        new Chart(weightCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: weightData,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Weight Progress'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
        
        // Workout Chart
        const workoutCtx = document.getElementById('workoutChart').getContext('2d');
        
        const workoutData = labels.map(() => Math.floor(Math.random() * 2));
        
        new Chart(workoutCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workout Completed',
                    data: workoutData,
                    backgroundColor: [
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)',
                        'rgba(0, 206, 201, 0.7)'
                    ],
                    borderColor: [
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)',
                        'rgba(0, 206, 201, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Workout Completion'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    function saveProgress() {
        const currentWeight = parseFloat(document.getElementById('currentWeight').value);
        const workoutCompleted = document.getElementById('workoutCompleted').value === 'yes';
        const waterConsumed = parseFloat(document.getElementById('waterConsumed').value);
        const sleepHours = parseFloat(document.getElementById('sleepHours').value);
        
        const today = new Date().toISOString().split('T')[0];
        
        // Check if we already have data for today
        const existingIndex = progressData.findIndex(item => item.date === today);
        
        if (existingIndex >= 0) {
            // Update existing entry
            progressData[existingIndex] = {
                date: today,
                weight: currentWeight,
                workoutCompleted,
                waterConsumed,
                sleepHours
            };
        } else {
            // Add new entry
            progressData.push({
                date: today,
                weight: currentWeight,
                workoutCompleted,
                waterConsumed,
                sleepHours
            });
        }
        
        localStorage.setItem('progressData', JSON.stringify(progressData));
        
        // Show success message
        alert('Progress saved successfully!');
        
        // Reset form
        document.getElementById('progressForm').reset();
        
        // Update charts
        initializeCharts();
    }
    
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionId).classList.add('active');
    }
});