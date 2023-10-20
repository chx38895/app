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



document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorDiv = document.getElementById('error');
  
  


  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Check if the passwords match
  if (password !== confirmPassword) {
    errorDiv.texttContent = '';
    errorDiv.classList.add('error-shake');
    errorDiv.textContent = "Passwords didn't match";
    setTimeout(() => {
      errorDiv.classList.remove('error-shake');
    }, 3000);
    return;
  }

  // Send the form data to the server using fetch
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  // Check the response and display a message
  if (response.ok) {
    alert('User registered successfully');
    window.location.href = '/login';
  } else {

    const error = await response.text();
    errorDiv.texttContent = '';
    errorDiv.classList.add('error-shake');
    errorDiv.textContent = error;
    setTimeout(() => {
      errorDiv.classList.remove('error-shake');
    }, 3000);
    return;
  }
});