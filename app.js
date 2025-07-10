// Supabase Setup
/*
const supabase = supabase.createClient(
  'https://tvmayuytlngcqnvmizlk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bWF5dXl0bG5nY3Fudm1pemxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzU0MTAsImV4cCI6MjA2Nzc1MTQxMH0.XMqHLbjNjh-FGA38BYbhVBdyORr8MQC6JkA-WIB9fH0',
  
);
*/

// Import createClient directly from the ESM build
    import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2/+esm';

    // Initialize your Supabase client
    const SUPABASE_URL = 'https://tvmayuytlngcqnvmizlk.supabase.co'; // Replace with your Supabase URL
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bWF5dXl0bG5nY3Fudm1pemxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzU0MTAsImV4cCI6MjA2Nzc1MTQxMH0.XMqHLbjNjh-FGA38BYbhVBdyORr8MQC6JkA-WIB9fH0'; // Replace with your Supabase Anon Key

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// DOM Elements
const authScreen = document.getElementById('auth');
const appScreen = document.getElementById('app');
const authBtn = document.getElementById('auth-btn');
const toggleBtn = document.getElementById('toggle-btn');
const toggleText = document.getElementById('toggle-text');
const errorMsg = document.getElementById('error');
const workoutDiv = document.getElementById('workout');
const completeBtn = document.getElementById('complete-btn');
const progressBar = document.getElementById('progress-bar');
const dayCount = document.getElementById('day-count');
const logoutBtn = document.getElementById('logout-btn');

// State
let isLogin = true;
let currentUser = null;

// Sample Workout
const workouts = [
  [
    { name: "Push-ups", sets: 3, reps: 10 },
    { name: "Squats", sets: 3, reps: 15 },
    { name: "Plank", sets: 3, duration: "30 sec" }
  ],
  // Add 3 more sample workouts...
];

// Initialize
init();

function init() {
  checkSession();
  setupEventListeners();
}

async function checkSession() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    showApp();
    loadWorkout();
  }
}

function setupEventListeners() {
  authBtn.addEventListener('click', handleAuth);
  toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    authBtn.textContent = isLogin ? 'Login' : 'Sign up';
    toggleText.innerHTML = isLogin 
      ? 'Need an account? <a href="#" id="toggle-btn">Sign up</a>' 
      : 'Have an account? <a href="#" id="toggle-btn">Login</a>';
  });
  completeBtn.addEventListener('click', completeWorkout);
  logoutBtn.addEventListener('click', () => supabase.auth.signOut().then(() => location.reload()));
}

async function handleAuth() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) throw error;
    if (data.user) {
      currentUser = data.user;
      if (!isLogin) await createProfile(data.user);
      showApp();
      loadWorkout();
    }
  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

async function createProfile(user) {
  await supabase.from('profiles').insert([{
    id: user.id,
    email: user.email,
    created_at: new Date().toISOString()
  }]);
}

function showApp() {
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
}

function loadWorkout() {
  const day = 1; // In real app: calculate day from start date
  const workout = workouts[day % workouts.length];
  
  workoutDiv.innerHTML = workout.map(ex => `
    <div class="exercise">
      <h3>${ex.name}</h3>
      <p>${ex.sets} sets × ${ex.reps || ex.duration}</p>
    </div>
  `).join('');

  // Update progress (hardcoded for MVP)
  updateProgress(5); // Example: 5 days completed
}

function updateProgress(days) {
  const percent = (days / 30) * 100;
  progressBar.style.width = `${percent}%`;
  dayCount.textContent = `Day ${days}/30`;
}

async function completeWorkout() {
  // In real app: save to Supabase
  completeBtn.textContent = "✓ Completed!";
  completeBtn.disabled = true;
  setTimeout(() => {
    completeBtn.textContent = "Complete Workout";
    completeBtn.disabled = false;
  }, 2000);
}

// PWA Setup
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}
