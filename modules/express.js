const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();

const CardModel = require("../src/models/cards.model");
const ServicesModel = require("../src/models/services.model");
const CartModel = require("../src/models/cart.model");
const RewardsModel = require("../src/models/rewards.model");
const UsableModel = require("../src/models/usable.model");
const RelatorioModel = require("../src/models/relatorio.model");

// Middlewares
app.use(cookieParser());
app.use(session({ secret: "secreto", resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // Middleware para analisar o corpo da solicitação como JSON
app.use(express.static("public"));

// Configuração da view
app.set("view engine", "ejs"); // Configura a view para EJS
app.set("views", "src/views");

// VIEWS GET -------------------------------------------------------------
app.get("/", async (req, res) => {
  try {
    //PEGANDO O CÓDIGO -
    const { codigo } = req.query;

    console.log(codigo);

    req.session.codigo = codigo;

    const lastCard = await CardModel.getLastCard();
    const services = await ServicesModel.getServices();
    const cartItems = await CartModel.getCartItems();
    const usableItems = await UsableModel.getAllUtilizaveis();
    const allCards = await CardModel.getCards();
    const getType2Cards = await CardModel.getCardsByType2();
    const getCardByCode = await CardModel.getCardByCode(codigo);
    const getCartItemsByCardCode = await CartModel.getCartItemsByCardCode(
      codigo
    );
    const getAllUtilByCod = await UsableModel.getAllUtilByCod(codigo);
    const getAvailableUtilByCod = await UsableModel.getAvailableUtilByCod(
      codigo
    );
    const relatorioCompras = await RelatorioModel.getRelatorioByCodigo(codigo);
    const todosRelatorio = await RelatorioModel.getAllRelatorio();
    // Log para verificar o valor de 'total' antes do render
    const total = getCartItemsByCardCode.reduce(
      (acc, item) => acc + parseFloat(item.preco),
      0
    );

    res.render("index", {
      lastCard,
      services,
      cartItems,
      total,
      usableItems,
      allCards,
      getType2Cards,
      getCardByCode,
      getCartItemsByCardCode,
      getAllUtilByCod,
      getAvailableUtilByCod,
      relatorioCompras,
      todosRelatorio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro na requisição");
  }
});
// VIEWS GET -------------------------------------------------------------

// Rota para obter um serviço pelo ID
app.get("/services/:id", async (req, res) => {
  try {
    const serviceId = req.params.id; // Obtém o ID do serviço a partir dos parâmetros da rota
    const service = await ServicesModel.getServicesById(serviceId); // Chama a função para obter o serviço

    if (service) {
      res.json(service); // Retorna o serviço encontrado como JSON
    } else {
      res.status(404).json({ error: "Serviço não encontrado" }); // Retorna um erro se o serviço não for encontrado
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro na requisição" });
  }
});

// Rota para atualizar o saldo do cartão após uma compra
app.post("/update-saldo", async (req, res) => {
  try {
    const novoSaldo = req.body.novoSaldo; // Obtenha o novo saldo da solicitação POST
    await CardModel.updateSaldo(novoSaldo); // Chame a função para atualizar o saldo

    res.status(200).json({ message: "Saldo atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar o saldo" });
  }
});

// ENDPOINTS ->
// Criar cartões -----------------------------------------------------------------------.
app.post("/cards", async (req, res) => {
  try {
    const { saldo, codigo } = req.body;
    const tipo = 2; // Valor fixo para o campo 'tipo'

    if (saldo === undefined || codigo === undefined) {
      return res
        .status(400)
        .json({ error: 'Campos "saldo" e "codigo" são obrigatórios' });
    }

    const createdCard = await CardModel.createCard(saldo, codigo, tipo);

    console.log(createdCard);

    res.redirect("/");
  } catch (error) {
    console.error("Erro ao criar o cartão:", error);
    res.status(500).json({ error: "Erro ao criar o cartão" });
  }
});

// Criar cartões -----------------------------------------------------------------------.

app.post("/comprar-carrinho", async (req, res) => {
  try {
    const codigo = req.session.codigo;
    console.log(codigo);
    // Pegas as informações de todos os items do carrinho!
    const getCartItemsByCardCode = await CartModel.getCartItemsByCardCode(
      codigo
    );

    // Pega o valor total de todos os preços do carrinho!
    const total = getCartItemsByCardCode.reduce(
      (acc, item) => acc + parseFloat(item.preco),
      0
    );

    console.log(total);

    // Verifique se o total é um número válido
    if (isNaN(total)) {
      console.error("Erro ao calcular o total do carrinho.");
      return res
        .status(500)
        .json({ error: "Erro ao calcular o total do carrinho" });
    }

    // Tente recuperar o saldo do banco de dados
    let saldo = parseFloat(await CardModel.getSaldoByCode(codigo));
    // Verifique se o saldo é um número válido
    if (isNaN(saldo)) {
      console.error("Erro ao recuperar saldo do banco de dados.");
      return res.status(500).json({ error: "Erro ao recuperar saldo" });
    }

    console.log(`Valor do Saldo: ${saldo}`);
    console.log(`Valor do Total: ${total}`);

    if (saldo < total) {
      console.log("Saldo insuficiente. Saldo:", saldo, "Total:", total);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // Itera pelos itens do carrinho
    for (const item of getCartItemsByCardCode) {
      // Verifica se o tipo do item é "Serviço"
      if (item.tipo === "Serviço") {
        // Insere na tabela 'utilizaveis'
        await UsableModel.insertUtilizavel(item.nome, item.tipo, codigo);
        await RelatorioModel.addItemToRelatorio(item.nome, item.preco, codigo);
      }
    }

    if (total >= 150) {
      await RewardsModel.insertRewardThree(codigo);
    } else if (total >= 100) {
      await RewardsModel.insertRewardTwo(codigo);
    } else if (total >= 50) {
      await RewardsModel.insertRewardOne(codigo);
    }

    const novoSaldo = saldo - total;
    await CardModel.updateSaldo(novoSaldo, codigo);

    console.log("Novo saldo após compra:", novoSaldo);

    await CartModel.cleanCartItems();

    res.status(200).json({ saldo: novoSaldo });
  } catch (error) {
    console.error("Erro na requisição:", error);
    res.status(500).json({ error: "Erro na requisição" });
  }
});

// Rota para inserir saldo no cartão
app.post("/add-saldo", async (req, res) => {
  try {
    const { codigo, saldo } = req.body;

    // Verifique se o código e o saldo são fornecidos
    if (!codigo || !saldo) {
      return res.status(400).json({ error: "Código e saldo são obrigatórios" });
    }

    // Chame a função do modelo para adicionar saldo ao cartão
    await CardModel.addSaldoByCodigo(codigo, saldo);
    console.log(`O valor de ${saldo} foi adicionado ao cartão ${codigo}`);

    // Redirecione para a página principal
    res.redirect("/");
  } catch (error) {
    console.error("Erro ao adicionar saldo:", error);
    res.status(500).json({ error: "Erro ao adicionar saldo" });
  }
});

// Rota para excluir cartão
app.post("/delete-card", async (req, res) => {
  try {
    const { codigo } = req.body;

    // Verifique se o código é fornecido
    if (!codigo) {
      return res.status(400).json({ error: "Código é obrigatório" });
    }

    // Chame a função do modelo para excluir o cartão
    await CardModel.deleteCardByCodigo(codigo);
    console.log(`Cartão do código ${codigo} foi excluído com sucesso.`);

    // Redirecione para a página principal
    res.redirect("/");
  } catch (error) {
    console.error("Erro ao excluir cartão:", error);
    res.status(500).json({ error: "Erro ao excluir cartão" });
  }
});

app.post("/add-to-cart", async (req, res) => {
  try {
    const { tipo, nome, preco, codigoCartao } = req.body;

    if (!tipo || !nome || !preco) {
      return res
        .status(400)
        .json({ error: "Tipo, nome e preço são obrigatórios!" });
    }

    await CartModel.addItemToCart(tipo, nome, preco, codigoCartao);

    // Item adicionado com sucesso, redirecionar para a página inicial
    res.redirect("/");
  } catch (error) {
    console.error("Erro na rota /add-to-cart:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao adicionar item ao carrinho" });
  }
});

// Rota para atualizar o estado do utilizável para 'Utilizado'
app.put("/utilizaveis/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    await UsableModel.updateUtilizavelToUtilizado(itemId);

    res.status(204).end(); // Responda com sucesso sem conteúdo
  } catch (error) {
    console.error(`Erro ao atualizar estado do utilizável: ${error}`);
    res
      .status(500)
      .json({ error: "Erro interno ao atualizar estado do utilizável" });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
