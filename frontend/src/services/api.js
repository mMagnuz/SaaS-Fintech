const API_URL = "http://localhost:8080/api";

export const api = {
  async login(email, senha) {
    const response = await fetch(`${API_URL}/usuario/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.mensagem || body.message || "E-mail ou senha inválidos.");
    return body;
  },

  async cadastrarUsuario(dadosUsuario) {
    const response = await fetch(`${API_URL}/usuario/criar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosUsuario)
    });
    if (!response.ok) throw new Error("Erro ao cadastrar usuário");
    return response.json();
  }
};