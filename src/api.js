const API = 'https://stock.dev.vilhena.ifro.edu.br/api';

async function request(url, options = {}) {
  const response = await fetch(API + url, {
    ...options,
    headers: { 'Content-Type': 'application/json' }
  });

  const texto = await response.text();
  let resultado = {};

  try {
    resultado = texto ? JSON.parse(texto) : {};
  } catch {
    resultado = { erro: texto };
  }

  if (!response.ok) {
    const erros = Array.isArray(resultado.erros) ? resultado.erros.join(' ') : resultado.erro;
    throw new Error(erros || 'Erro na API: ' + response.status);
  }

  return resultado;
}

export function get(url) {
  return request(url);
}

export function post(url, data) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function carregarDados() {
  const [categorias, produtos, clientes, pedidos, itens] = await Promise.all([
    get('/categorias'),
    get('/produtos'),
    get('/clientes'),
    get('/pedidos'),
    get('/itens_pedido')
  ]);

  return { categorias, produtos, clientes, pedidos, itens };
}
