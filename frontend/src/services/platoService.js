const API_URL = 'https://burgertic-jacofsky-czerwiak.vercel.app/api';

export const obtenerPlatos = async () => {
  try {
    const response = await fetch(`${API_URL}/platos`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching platos:', error);
    throw error;
  }
};