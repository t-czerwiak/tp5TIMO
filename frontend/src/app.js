const API_URL = 'https://burgertic-jacofsky-czerwiak.vercel.app/api';

async function fetchMenu() {
  try {
    const response = await fetch(`${API_URL}/platos`);
    const data = await response.json();
    console.log('Menu:', data);
  } catch (error) {
    console.error('Error fetching menu:', error);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = event.target.username.value;
  const password = event.target.password.value;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    console.log('Login response:', data);
  } catch (error) {
    console.error('Error logging in:', error);
  }
}