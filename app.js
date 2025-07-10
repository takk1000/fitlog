// Supabase setup
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);




// DOM Elements
const authSection = document.getElementById('auth-section');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authModal = document.getElementById('auth-modal');
const modalTitle = document.getElementById('modal-title');
const authForm = document.getElementById('auth-form');
const closeModal = document.querySelector('.close');
const appContent = document.getElementById('app-content');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const workoutList = document.getElementById('workout-list');
const completeBtn = document.getElementById('complete-btn');
const calendarGrid = document.getElementById('calendar-grid');

// DOM Elements
// const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authSubmitBtn = document.getElementById('auth-submit');
const authToggle = document.getElementById('toggle-auth');
const authToggleText = document.getElementById('auth-toggle');

// DOM Elements
const authContainer = document.getElementById('auth-container');
const welcomeContainer = document.getElementById('welcome-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authButton = document.getElementById('auth-button');
const toggleLink = document.getElementById('toggle-link');
const errorMessage = document.getElementById('error-message');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const workoutScreen = document.getElementById('workout-screen');
const workoutContainer = document.getElementById('workout-container');
const completeButton = document.getElementById('complete-button');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Initialize
initAuth();



// State
let isSignup = true;
let currentUser = null;
let workoutCompleted = false;

// Sample workout data
const sampleWorkout = [
  { name: "Push-ups", reps: "3 sets of 10" },
  { name: "Squats", reps: "3 sets of 15" },
  { name: "Plank", reps: "Hold for 1 minute" },
  { name: "Lunges", reps: "3 sets of 10 each leg" }
];

// Initialize the app
init();

function init() {
  // Check if user is already logged in
  checkAuthState();
  
  // Set up event listeners
  setupEventListeners();
  
  // Render sample workout (in a real app, this would come from the database)
  renderWorkout();
  
  // Render calendar
  renderCalendar();

    // Check existing session
  checkSession();
  
  // Event listeners
  authButton.addEventListener('click', handleAuth);
  toggleLink.addEventListener('click', toggleAuthMode);
  logoutButton.addEventListener('click', handleLogout);
}


async function initAuth() {
  // Check existing session
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    loadWorkout();
    authScreen.classList.add('hidden');
    workoutScreen.classList.remove('hidden');
  }
  
  // Setup auth listeners
  document.getElementById('auth-button').addEventListener('click', handleAuth);
  document.getElementById('toggle-link').addEventListener('click', toggleAuthMode);
  document.getElementById('logout-button').addEventListener('click', handleLogout);
}

async function loadWorkout() {
  // In a real app, you would fetch from Supabase:
  // const { data } = await supabase.from('workouts').select('*').eq('day', currentDay);
  
  // For MVP, use sample data
  const currentDay = 1; // Would calculate based on user's start date
  const workoutKey = `workout_${currentDay % 4 || 4}`; // Cycle through 4 workouts
  const workout = sampleWorkouts[workoutKey];
  
  workoutContainer.innerHTML = '';
  workout.forEach(ex => {
    const exEl = document.createElement('div');
    exEl.className = 'exercise';
    exEl.innerHTML = `
      <h3>${ex.name}</h3>
      <p>${ex.sets} sets × ${ex.reps}</p>
    `;
    workoutContainer.appendChild(exEl);
  });
  
  // Update progress (would fetch from user's completion history)
  const daysCompleted = 1; // Would query Supabase
  const progress = (daysCompleted / 90) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `Day ${daysCompleted} of 90`;
}

completeButton.addEventListener('click', async () => {
  // Record completion in Supabase
  /* await supabase.from('completions').insert([{
    user_id: (await supabase.auth.getUser()).data.user.id,
    date: new Date().toISOString(),
    workout_type: currentWorkout
  }]); */
  
  // For MVP just show confirmation
  completeButton.textContent = "✓ Workout Completed!";
  completeButton.disabled = true;
  setTimeout(() => {
    completeButton.textContent = "Mark as Completed";
    completeButton.disabled = false;
  }, 2000);
});


function setupEventListeners() {
  signupBtn.addEventListener('click', () => showAuthModal(true));
  loginBtn.addEventListener('click', () => showAuthModal(false));
  logoutBtn.addEventListener('click', handleLogout);
  closeModal.addEventListener('click', () => authModal.classList.add('hidden'));
  authForm.addEventListener('submit', handleAuthSubmit);
  completeBtn.addEventListener('click', markWorkoutComplete);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.add('hidden');
    }
  });
}

async function checkAuthState() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    currentUser = user;
    updateUIForAuth(true);
    // In a real app, you would fetch user data here
  } else {
    updateUIForAuth(false);
  }
}

function showAuthModal(isSignupMode) {
  isSignup = isSignupMode;
  modalTitle.textContent = isSignupMode ? "Sign Up" : "Login";
  authModal.classList.remove('hidden');
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    let authResponse;
    
    if (isSignup) {
      authResponse = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authResponse.data.user) {
        // Create user profile in your database
        await createUserProfile(authResponse.data.user);
      }
    } else {
      authResponse = await supabase.auth.signInWithPassword({
        email,
        password
      });
    }
    
    if (authResponse.error) throw authResponse.error;
    
    currentUser = authResponse.data.user;
    updateUIForAuth(true);
    authModal.classList.add('hidden');
    authForm.reset();
    
    // In a real app, you would fetch user data here
  } catch (error) {
    alert(error.message);
  }
}

async function createUserProfile(user) {
  // In a real app, you would add more user info here
  const { error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: user.id, 
        email: user.email,
        created_at: new Date().toISOString()
      }
    ]);
    
  if (error) throw error;
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    alert(error.message);
  } else {
    currentUser = null;
    updateUIForAuth(false);
  }
}

function updateUIForAuth(isAuthenticated) {
  if (isAuthenticated) {
    signupBtn.classList.add('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    appContent.classList.remove('hidden');
    
    // Update user-specific content
    updateProgress(7); // Example: 7 days completed
  } else {
    signupBtn.classList.remove('hidden');
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    appContent.classList.add('hidden');
  }
}


// Sample Workouts Data Structure (Would normally be in Supabase)
const sampleWorkouts = {
  "workout_1": [
    { name: "Push-ups", sets: "3", reps: "10-12" },
    { name: "Squats", sets: "3", reps: "15" },
    { name: "Plank", sets: "3", reps: "30 sec" },
    { name: "Lunges", sets: "3", reps: "10 each leg" },
    { name: "Bicep Curls", sets: "3", reps: "12" },
    { name: "Shoulder Press", sets: "3", reps: "10" },
    { name: "Russian Twists", sets: "3", reps: "20" },
    { name: "Jumping Jacks", sets: "3", reps: "30" }
  ],
  "workout_2": [
    // ... similar structure for 3 more workouts
  ]
};
function renderWorkout() {
  workoutList.innerHTML = '';
  
  sampleWorkout.forEach(exercise => {
    const exerciseItem = document.createElement('div');
    exerciseItem.className = 'exercise-item';
    exerciseItem.innerHTML = `
      <div class="exercise-name">${exercise.name}</div>
      <div class="exercise-reps">${exercise.reps}</div>
    `;
    workoutList.appendChild(exerciseItem);
  });
}

function renderCalendar() {
  calendarGrid.innerHTML = '';
  
  // Example: Show 30 days with some completed
  for (let i = 1; i <= 30; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = `day ${i <= 7 ? 'completed' : ''}`; // Example: 7 days completed
    dayElement.textContent = i;
    calendarGrid.appendChild(dayElement);
  }
}

function updateProgress(daysCompleted) {
  const percentage = (daysCompleted / 30) * 100;
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `${daysCompleted}/30 days completed`;
}

async function markWorkoutComplete() {
  if (!currentUser) return;
  
  try {
    // In a real app, you would save this to your database
    // Example:
    /*
    const { error } = await supabase
      .from('workouts')
      .insert([
        { 
          user_id: currentUser.id,
          date: new Date().toISOString(),
          exercises: sampleWorkout
        }
      ]);
    
    if (error) throw error;
    */
    
    // For this prototype, we'll just update the UI
    workoutCompleted = true;
    completeBtn.textContent = "Completed!";
    completeBtn.disabled = true;
    completeBtn.style.backgroundColor = "var(--success-color)";
    
    // Update progress (in a real app, you would calculate this from the database)
    updateProgress(8); // Example: now 8 days completed
    
    // Update calendar (in a real app, you would fetch actual completed days)
    const days = document.querySelectorAll('.day');
    days[7].classList.add('completed'); // Mark day 8 as completed (0-indexed)
    
    alert("Workout logged successfully!");
  } catch (error) {
    alert("Error saving workout: " + error.message);
  }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}


// Auth State
let isLoginMode = true;


// Initialize auth form
function initAuth() {
  updateAuthUI();
  
  // Form submission
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    try {
      if (isLoginMode) {
        await handleLogin(username, password);
      } else {
        await handleSignup(username, password);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  
  // Toggle between login/signup
  authToggle.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    updateAuthUI();
  });
}

// Update UI based on auth mode
function updateAuthUI() {
  if (isLoginMode) {
    authSubmitBtn.textContent = 'Sign In';
    authToggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-auth">Sign up</a>';
  } else {
    authSubmitBtn.textContent = 'Create Account';
    authToggleText.innerHTML = 'Already have an account? <a href="#" id="toggle-auth">Sign in</a>';
  }
  usernameInput.value = '';
  passwordInput.value = '';
}

// Handle login
async function handleLogin(username, password) {
  // In Supabase, we'll use email field but treat it as username
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@yourdomain.com`, // Fake email domain
    password: password
  });
  
  if (error) {
    // If user not found, offer to create account
    if (error.message.includes('Invalid login credentials')) {
      if (confirm('User not found. Would you like to create an account?')) {
        isLoginMode = false;
        updateAuthUI();
        return;
      }
    }
    throw error;
  }
  
  // Login successful
  console.log('Logged in:', data.user);
  showAppContent();
}

// Handle signup
async function handleSignup(username, password) {
  // Check if username exists (simple version - in real app you'd query your users table)
  const { data: { user } } = await supabase.auth.signInWithPassword({
    email: `${username}@yourdomain.com`,
    password: password
  });
  
  if (user) {
    throw new Error('Username already exists');
  }
  
  // Create new user
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@yourdomain.com`, // Fake email
    password: password,
    options: {
      data: {
        username: username // Store username in user_metadata
      }
    }
  });
  
  if (error) throw error;
  
  // Create user profile in your database
  await createUserProfile(data.user, username);
  
  // Auto-login after signup
  await handleLogin(username, password);
}

// Create user profile in your database
async function createUserProfile(user, username) {
  const { error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: user.id,
        username: username,
        email: `${username}@yourdomain.com`, // Fake email
        created_at: new Date().toISOString()
      }
    ]);
    
  if (error) throw error;
}

async function checkSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) showWelcomePage(user.email);
}

function toggleAuthMode(e) {
  e.preventDefault();
  isLogin = !isLogin;
  authButton.textContent = isLogin ? 'Login' : 'Sign up';
  document.getElementById('toggle-link').textContent = isLogin ? 'Sign up' : 'Login';
  errorMessage.textContent = '';
}

async function handleAuth() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    let authResponse;
    
    if (isLogin) {
      authResponse = await supabase.auth.signInWithPassword({ email, password });
    } else {
      authResponse = await supabase.auth.signUp({ email, password });
      
      // Create basic CRM profile
      if (authResponse.data.user) {
        await supabase
          .from('profiles')
          .insert([{ 
            id: authResponse.data.user.id, 
            email: email,
            last_login: new Date().toISOString()
          }]);
      }
    }

    if (authResponse.error) throw authResponse.error;
    showWelcomePage(email);
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

function showWelcomePage(email) {
  authContainer.style.display = 'none';
  welcomeContainer.style.display = 'flex';
  userEmailSpan.textContent = email;
}

async function handleLogout() {
  await supabase.auth.signOut();
  welcomeContainer.style.display = 'none';
  authContainer.style.display = 'flex';
  emailInput.value = '';
  passwordInput.value = '';
}

// Show main app after auth
function showAppContent() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app-content').classList.remove('hidden');
  // Load user data here
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initAuth);


