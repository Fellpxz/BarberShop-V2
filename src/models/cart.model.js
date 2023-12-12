const connectToDatabase = require("../database/connect");

async function addItemToCart(tipo, nome, preco, codigoCartao) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "INSERT INTO carrinho (tipo, nome, preco, codigoCartao) VALUES (?, ?, ?, ?)",
      [tipo, nome, preco, codigoCartao]
    );

    await connection.end();
    console.log("Item adicionado ao carrinho com sucesso");
    return rows.insertId;
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    throw error; // Rejeita o erro para que ele seja capturado no bloco catch da rota
  }
}

//Função que pega items do carrinho
async function getCartItems() {
  const connection = await connectToDatabase();

  try {
    // Execute a consulta SQL para obter todos os itens do carrinho
    const [rows] = await connection.execute("SELECT * FROM carrinho");

    return rows;
  } catch (error) {
    console.error("Erro ao obter itens do carrinho:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Função para apagar todos os itens do carrinho
async function cleanCartItems() {
  const connection = await connectToDatabase();

  try {
    // Execute a instrução SQL DELETE sem uma cláusula WHERE para apagar todos os registros
    await connection.execute("DELETE FROM carrinho");

    console.log("Carrinho limpo com sucesso.");
  } catch (error) {
    console.error("Erro ao limpar o carrinho:", error);
    throw error;
  } finally {
    // Certifique-se de sempre fechar a conexão, independentemente do resultado
    await connection.end();
  }
}

// Função que pega items do carrinho de acordo com o código do cartão
async function getCartItemsByCardCode(codigoCartao) {
  const connection = await connectToDatabase();

  try {
    // Execute a consulta SQL para obter os itens do carrinho para um código de cartão específico
    const [rows] = await connection.execute(
      "SELECT * FROM carrinho WHERE codigoCartao = ?",
      [codigoCartao || null] // Use null se o códigoCartao for indefinido
    );

    return rows;
  } catch (error) {
    console.error(
      "Erro ao obter itens do carrinho por código do cartão:",
      error
    );
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = {
  addItemToCart,
  getCartItems,
  cleanCartItems,
  getCartItemsByCardCode,
};
