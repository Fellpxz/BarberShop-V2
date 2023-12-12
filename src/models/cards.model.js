const connectToDatabase = require("../database/connect");

//----------------------------------------------------------------------------------

async function createCard(saldo, codigo, tipo) {
  const connection = await connectToDatabase();

  if (saldo === undefined || codigo === undefined) {
    return null; // Ou você pode lançar um erro ou lidar de outra forma
  }

  const [rows] = await connection.execute(
    "INSERT INTO cartoes (saldo, codigo, tipo) VALUES (?, ?, ?)",
    [saldo, codigo, tipo]
  );

  await connection.end();
  return rows.insertId;
}

//----------------------------------------------------------------------------------

// Função para obter todos os cartões
async function getCards() {
  const connection = await connectToDatabase(); // Conecta ao banco de dados

  // Seleciona todos os registros da tabela 'cartoes'
  const [rows] = await connection.execute("SELECT * FROM cartoes");

  await connection.end(); // Encerra a conexão com o banco de dados
  return rows; // Retorna os registros de cartões
}

//----------------------------------------------------------------------------------

// Função para obter o saldo do último cartão
async function getSaldoByCode(codigo) {
  const connection = await connectToDatabase();
  const [rows] = await connection.execute(
    "SELECT saldo FROM cartoes WHERE codigo = ?",
    [codigo]
  );
  await connection.end();

  if (rows.length > 0) {
    return rows[0].saldo;
  }

  return 0; // Se nenhum registro for encontrado, retorne 0 ou outro valor padrão.
}

//----------------------------------------------------------------------------------

async function getLastCard() {
  const connection = await connectToDatabase();

  const [rows] = await connection.execute(
    "SELECT * FROM cartoes ORDER BY id DESC LIMIT 1"
  );

  await connection.end();
  return rows;
}

//----------------------------------------------------------------------------------

async function updateSaldo(novoSaldo, codigo) {
  const connection = await connectToDatabase();

  // Etapa 2: Atualizar o saldo
  const [updateRows] = await connection.execute(
    "UPDATE cartoes SET saldo = ? WHERE codigo = ?",
    [novoSaldo, codigo]
  );

  await connection.end();

  return codigo;
}

//----------------------------------------------------------------------------------

// Função para adicionar saldo ao cartão pelo código
async function addSaldoByCodigo(codigo, saldo) {
  const connection = await connectToDatabase();

  const [rows] = await connection.execute(
    "UPDATE cartoes SET saldo = saldo + ? WHERE codigo = ?",
    [saldo, codigo]
  );

  await connection.end();
  return rows.affectedRows; // Retorna o número de linhas afetadas (deve ser 1 se o código existir)
}

//----------------------------------------------------------------------------------

// Função para excluir cartão pelo código
async function deleteCardByCodigo(codigo) {
  const connection = await connectToDatabase();

  const [rows] = await connection.execute(
    "DELETE FROM cartoes WHERE codigo = ?",
    [codigo]
  );

  await connection.end();
  return rows.affectedRows; // Retorna o número de linhas afetadas (deve ser 1 se o código existir)
}

//----------------------------------------------------------------------------------

async function getCardByCode(codigo) {
  try {
    const connection = await connectToDatabase(); // Obter conexão

    const [rows] = await connection.execute(
      "SELECT * FROM cartoes WHERE codigo = ?",
      [codigo || null]
    );

    await connection.end(); // Liberar a conexão

    // Verifica se há pelo menos um cartão encontrado
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
}

async function getCardsByType2() {
  const connection = await connectToDatabase(); // Conecta ao banco de dados

  // Seleciona todos os registros da tabela 'cartoes' onde o tipo é 2
  const [rows] = await connection.execute(
    "SELECT * FROM cartoes WHERE tipo = '2'"
  );

  await connection.end(); // Encerra a conexão com o banco de dados
  return rows; // Retorna os registros de cartões do tipo 2
}

// Exporta as funções para serem usadas em outros lugares
module.exports = {
  createCard,
  getCards,
  getSaldoByCode,
  updateSaldo,
  getLastCard,
  addSaldoByCodigo,
  deleteCardByCodigo,
  getCardByCode,
  getCardsByType2,
};
