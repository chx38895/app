async function checkAuthentication() {
  try {
    const response = await fetch('/check-auth'); 
    if (response.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}
checkAuthentication();


const html = document.querySelector('html');
const themeToggle = document.getElementsByClassName('theme')[0];

themeToggle.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (response.ok) {

    window.location.href = '/';
  } else {
    errorDiv.texttContent = '';
    errorDiv.classList.add('error-shake');
    const error = await response.text();
    errorDiv.textContent = error;
    setTimeout(() => {
      errorDiv.classList.remove('error-shake');
    }, 3000);
    
  }
}