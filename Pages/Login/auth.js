const loginForm = document.getElementById('loginForm');
const signupFormContainer = document.getElementById('signupFormContainer');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const loginContainer = document.getElementById('loginForm').parentElement; // assuming loginForm is inside container
const signupMessage = document.getElementById('signupMessage');

// Show signup form
showSignupLink.addEventListener('click', e => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupFormContainer.style.display = 'block';
  signupMessage.textContent = '';
});

// Show login form
showLoginLink.addEventListener('click', e => {
  e.preventDefault();
  signupFormContainer.style.display = 'none';
  loginForm.style.display = 'block';
});

// Handle signup submission
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!username || !password) {
    signupMessage.textContent = 'Please fill all fields.';
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[username]) {
    signupMessage.textContent = 'Username already exists.';
    return;
  }

  users[username] = { password };
  localStorage.setItem('users', JSON.stringify(users));
  signupMessage.style.color = 'green';
  signupMessage.textContent = 'Account created! You can now log in.';
  signupForm.reset();
});

// Handle login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    loginMessage.textContent = 'Please enter username and password.';
    return;
  }

  const users = getUsers();

  if (!users[username]) {
    loginMessage.textContent = 'User not found.';
    return;
  }

  if (users[username].password !== password) {
    loginMessage.textContent = 'Incorrect password.';
    return;
  }

  // Login success
  loginMessage.style.color = 'green';
  loginMessage.textContent = 'Login successful! Redirecting...';

  // Mark user as logged in (e.g., save username to localStorage)
  localStorage.setItem('loggedInUser', username);

  // Redirect to home or dashboard after short delay
  setTimeout(() => {
    window.location.href = '../../index.html';  // adjust path if needed
  }, 1500);
});
