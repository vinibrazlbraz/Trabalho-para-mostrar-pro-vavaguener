import { carregarDados, get, post } from './api.js';

const app = document.querySelector('#app');
const integrante = 'Vinicius Leopoldino Braz';

let dados = null;
let mensagem = '';
let menuAberto = false;

function rota() {
  return location.hash.replace('#/', '') || 'home';
}

function buscar(lista, id) {
  return lista.find((item) => String(item.id) === String(id));
}

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function dataFormatada(data) {
  return data ? new Date(data).toLocaleDateString('pt-BR') : '-';
}

function cabecalho() {
  return `
    <header>
      <a class="logo" href="#/home">Stock API</a>
      <button class="menu-botao" id="botao-menu" type="button" aria-label="Abrir menu" aria-expanded="${menuAberto}">
        <img src="/img/menu-${menuAberto ? 'aberto' : 'fechado'}.svg" alt="" />
      </button>
      <nav class="${menuAberto ? 'aberto' : ''}">
        <a href="#/home">Home</a>
        <a href="#/categorias">Categorias</a>
        <a href="#/produtos">Produtos</a>
        <a href="#/clientes">Clientes</a>
        <a href="#/pedidos">Pedidos</a>
        <a class="botao" href="#/novo-pedido">Criar pedido</a>
      </nav>
    </header>
  `;
}

function tabela(titulo, cabecalhos, linhas) {
  return `
    <section class="pagina">
      <h1>${titulo}</h1>
      <div class="tabela-container">
        <table>
          <thead><tr>${cabecalhos.map((item) => `<th>${item}</th>`).join('')}</tr></thead>
          <tbody>${linhas.join('')}</tbody>
        </table>
      </div>
    </section>
  `;
}

function home() {
  return `
    <section class="pagina home">
      <div class="faixa-alerta">🚨 ATENÇÃO: SITE FEITO COM 2% DE PLANEJAMENTO 🚨</div>
      <h1>Controle de estoque<br /><span>(mais ou menos)</span></h1>
      <p>Aplicação desenvolvida na base do “funciona na minha máquina”.</p>
      <div class="integrantes">
        <h2>👑 Integrante Supremo 👑</h2>
        <p>${integrante}</p>
      </div>
      <div class="meme-grid">
        <div class="meme">QUANDO O PEDIDO FUNCIONA DE PRIMEIRA:<br /><strong>IMPOSSÍVEL</strong></div>
        <div class="meme meme-amarelo">API RESPONDEU 200<br /><strong>HOJE TEM FESTA</strong></div>
        <div class="meme meme-verde">PROFESSOR: “EXPLIQUE O CÓDIGO”<br /><strong>EU: FETCH...</strong></div>
      </div>
      <div class="atalhos">
        <a class="botao" href="#/pedidos">Ver pedidos</a>
        <a class="botao secundario" href="#/novo-pedido">Criar pedido</a>
      </div>
    </section>
  `;
}

function listarCategorias() {
  const linhas = dados.categorias.map((categoria) => `
    <tr><td>${categoria.id}</td><td>${categoria.nome}</td></tr>
  `);
  return tabela('Categorias', ['ID', 'Nome'], linhas);
}

function listarProdutos() {
  const linhas = dados.produtos.map((produto) => `
    <tr>
      <td>${produto.nome}</td>
      <td>${buscar(dados.categorias, produto.categoria_id)?.nome || '-'}</td>
      <td>${dinheiro(produto.preco)}</td>
      <td>${produto.quantidade_estoque}</td>
    </tr>
  `);
  return tabela('Produtos', ['Produto', 'Categoria', 'Preço', 'Estoque'], linhas);
}

function listarClientes() {
  const linhas = dados.clientes.map((cliente) => `
    <tr><td>${cliente.nome}</td><td>${cliente.email}</td><td>${cliente.telefone}</td></tr>
  `);
  return tabela('Clientes', ['Nome', 'E-mail', 'Telefone'], linhas);
}

function listarPedidos() {
  const linhas = dados.pedidos.map((pedido) => {
    const cliente = buscar(dados.clientes, pedido.cliente_id);
    const itens = dados.itens.filter((item) => String(item.pedido_id ?? item.pedido_numero) === String(pedido.id));
    const textoItens = itens.map((item) => {
      const produto = buscar(dados.produtos, item.produto_id);
      return `${produto?.nome || 'Produto'} (${item.quantidade})`;
    }).join(', ');

    return `
      <tr>
        <td>#${pedido.id}</td>
        <td>${cliente?.nome || '-'}</td>
        <td>${dataFormatada(pedido.data_pedido)}</td>
        <td>${pedido.status}</td>
        <td>${textoItens || '-'}</td>
      </tr>
    `;
  });

  return `
    <section class="pagina">
      <div class="titulo-com-botao"><h1>Pedidos</h1><a class="botao" href="#/novo-pedido">Criar pedido</a></div>
      ${mensagem ? `<p class="mensagem">${mensagem}</p>` : ''}
      <div class="tabela-container">
        <table>
          <thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Status</th><th>Itens</th></tr></thead>
          <tbody>${linhas.join('')}</tbody>
        </table>
      </div>
    </section>
  `;
}

function novoPedido() {
  return `
    <section class="pagina">
      <h1>Criar pedido</h1>
      ${mensagem ? `<p class="mensagem">${mensagem}</p>` : ''}
      <form id="form-pedido">
        <label for="cliente">Cliente</label>
        <select id="cliente" required>
          <option value="">Selecione um cliente</option>
          ${dados.clientes.map((cliente) => `<option value="${cliente.id}">${cliente.nome}</option>`).join('')}
        </select>

        <label for="produto">Produto</label>
        <select id="produto" required>
          <option value="">Selecione um produto</option>
          ${dados.produtos.map((produto) => `<option value="${produto.id}">${produto.nome}</option>`).join('')}
        </select>

        <label for="quantidade">Quantidade</label>
        <input id="quantidade" type="number" min="1" value="1" required />

        <button class="botao" type="submit">Salvar pedido</button>
      </form>
    </section>
  `;
}

function renderizar() {
  const paginas = {
    home,
    categorias: listarCategorias,
    produtos: listarProdutos,
    clientes: listarClientes,
    pedidos: listarPedidos,
    'novo-pedido': novoPedido
  };

  if (!dados) {
    app.innerHTML = cabecalho() + '<p class="carregando">Carregando dados...</p>';
    return;
  }

  app.innerHTML = cabecalho() + (paginas[rota()] || home)();
}

function idDaResposta(resposta) {
  const objeto = Array.isArray(resposta) ? resposta[0] || {} : resposta || {};
  return objeto.id || objeto.pedido_id || objeto.numero || objeto.pedido?.id || objeto.data?.id;
}

async function salvarPedido(event) {
  event.preventDefault();

  const clienteId = document.querySelector('#cliente').value;
  const produtoId = document.querySelector('#produto').value;
  const quantidade = Number(document.querySelector('#quantidade').value);
  const produto = buscar(dados.produtos, produtoId);

  if (!clienteId || !produto || quantidade < 1) {
    mensagem = 'Selecione o cliente, o produto e uma quantidade válida.';
    renderizar();
    return;
  }

  try {
    const resposta = await post('/pedidos', {
      cliente_id: Number(clienteId),
      status: 'pendente'
    });

    let pedidoId = idDaResposta(resposta);

    // Se o POST não devolver o ID, localiza o pedido mais recente desse cliente.
    if (!pedidoId) {
      const pedidosAtualizados = await get('/pedidos');
      pedidoId = pedidosAtualizados
        .filter((pedido) => String(pedido.cliente_id) === String(clienteId))
        .sort((a, b) => Number(b.id) - Number(a.id))[0]?.id;
    }

    if (!pedidoId) {
      throw new Error('A API não retornou o ID do pedido.');
    }

    await post('/itens_pedido', {
      pedido_id: Number(pedidoId),
      produto_id: Number(produtoId),
      quantidade,
      preco_unitario: Number(produto.preco)
    });

    dados = await carregarDados();
    mensagem = 'Pedido criado com sucesso!';
    location.hash = '#/pedidos';
  } catch (erro) {
    mensagem = 'Não foi possível criar o pedido: ' + erro.message;
  }

  renderizar();
}

document.addEventListener('click', (event) => {
  if (event.target.closest('#botao-menu')) {
    menuAberto = !menuAberto;
    renderizar();
    return;
  }

  if (event.target.closest('nav a')) {
    menuAberto = false;
    renderizar();
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'form-pedido') salvarPedido(event);
});

window.addEventListener('hashchange', () => {
  if (rota() !== 'pedidos') mensagem = '';
  menuAberto = false;
  renderizar();
});

async function iniciar() {
  renderizar();
  try {
    dados = await carregarDados();
    renderizar();
  } catch (erro) {
    app.innerHTML = cabecalho() + '<p class="erro">Erro ao carregar a API. Tente atualizar a página.</p>';
  }
}

iniciar();
