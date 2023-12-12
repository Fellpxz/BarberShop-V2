const connectToDatabase = require("../database/connect");

async function getAllUtilizaveis() {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute("SELECT * FROM utilizaveis");
    return rows;
  } catch (error) {
    console.error("Erro ao obter todos os utilizaveis:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function getAllUtilByCod(codigo) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM utilizaveis WHERE CodigoCartao = ?",
      [codigo || null]
    );
    return rows;
  } catch (error) {
    console.error("Erro ao obter utilizáveis por código de cartão:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function getAvailableUtilByCod(codigo) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM utilizaveis WHERE CodigoCartao = ? AND Estado = 'Disponivel'",
      [codigo || null]
    );
    return rows;
  } catch (error) {
    console.error(
      "Erro ao obter utilizáveis disponíveis por código de cartão:",
      error
    );
    throw error;
  } finally {
    await connection.end();
  }
}

async function deleteUtilizavel(itemId) {
  const connection = await connectToDatabase();

  try {
    await connection.execute("DELETE FROM utilizaveis WHERE ID = ?", [itemId]);
  } catch (error) {
    console.error(`Erro ao excluir utilizável do banco de dados: ${error}`);
    throw error;
  } finally {
    await connection.end();
  }
}

async function updateUtilizavelToUtilizado(itemId) {
  const connection = await connectToDatabase();

  try {
    await connection.execute(
      "UPDATE utilizaveis SET Estado = 'Utilizado' WHERE ID = ?",
      [itemId]
    );
  } catch (error) {
    console.error(
      `Erro ao atualizar o estado do utilizável para 'Utilizado': ${error}`
    );
    throw error;
  } finally {
    await connection.end();
  }
}

async function insertUtilizavel(nome, tipo, codigoCartao) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "INSERT INTO utilizaveis (Nome, Tipo, Estado, codigoCartao) VALUES (?, ?, ?, ?)",
      [nome, tipo, "Disponivel", codigoCartao]
    );

    return rows.insertId;
  } catch (error) {
    console.error("Erro ao inserir utilizável:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = {
  getAllUtilizaveis,
  deleteUtilizavel,
  insertUtilizavel,
  getAllUtilByCod,
  updateUtilizavelToUtilizado,
  getAvailableUtilByCod,
};
