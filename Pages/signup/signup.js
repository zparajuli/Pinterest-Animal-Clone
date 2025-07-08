// signup.js

const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');

signupForm.addEventListener('submit', e => {
  e.preventDefault();

  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!username || !password) {
    signupMessage.style.color = 'red';
    signupMessage.textContent = 'Please fill in all fields.';
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '{}');

  if (users[username]) {
    signupMessage.style.color = 'red';
    signupMessage.textContent = 'Username already exists.';
    return;
  }

  users[username] = { password };
  localStorage.setItem('users', JSON.stringify(users));

  signupMessage.style.color = 'green';
  signupMessage.textContent = 'Account created successfully! Redirecting to login...';

  signupForm.reset();

  
  setTimeout(() => {
    window.location.href = '../login/login.html';
  }, 2000);
});
