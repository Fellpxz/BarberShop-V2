const connectToDatabase = require("../database/connect");

async function addItemToRelatorio(nome, preco, codigoCartao) {
  const connection = await connectToDatabase(); // Substitua por sua função de conexão
  try {
    // Insira os dados na tabela relatorio
    const [result] = await connection.execute(
      "INSERT INTO relatorio (nome, preco, codigoCartao) VALUES (?, ?, ?)",
      [nome, preco, codigoCartao]
    );

    // Verifique se a inserção foi bem-sucedida
    if (result.affectedRows > 0) {
      console.log("Item adicionado ao relatório com sucesso!");
    } else {
      console.log("Falha ao adicionar item ao relatório.");
    }
  } catch (error) {
    console.error("Erro ao adicionar item ao relatório:", error);
  } finally {
    await connection.end(); // Certifique-se de fechar a conexão após o uso
  }
}

async function getRelatorioByCodigo(codigo) {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM relatorio WHERE codigoCartao = ?",
      [codigo || null] // Se 'codigo' for undefined, substitui por null
    );
    return rows;
  } catch (error) {
    console.error("Erro ao obter relatório por código de cartão:", error);
    throw error;
  }
}

async function getAllRelatorio() {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute("SELECT * FROM relatorio");
    return rows;
  } catch (error) {
    console.error("Erro ao obter todos os registros do relatório:", error);
    throw error;
  }
}

module.exports = {
  addItemToRelatorio,
  getRelatorioByCodigo,
  getAllRelatorio,
};
