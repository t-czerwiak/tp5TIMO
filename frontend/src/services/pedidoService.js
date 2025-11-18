import API_URL from '../config/api.js';

export const obtenerPedidos = async () => {
  try {
    const response = await fetch(`${API_URL}/pedidos`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

export const crearPedido = async (pedidoData) => {
  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};