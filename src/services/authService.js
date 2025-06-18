// src/services/authService.js

const API_URL = "https://104.248.118.8";

export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    return data; // { token: "..." }
  } catch (error) {
    throw new Error("Error al conectar con el servidor");
  }
}
