const connectToDatabase = require("../database/connect");

async function insertRewardOne(codigoCartao) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "INSERT INTO utilizaveis (Nome, Tipo, codigoCartao) VALUES (?, ?, ?)",
      ["Hidratação Capilar", "Recompensa", codigoCartao]
    );

    return rows.insertId;
  } catch (error) {
    console.error("Erro ao inserir recompensa um:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function insertRewardTwo(codigoCartao) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "INSERT INTO utilizaveis (Nome, Tipo, codigoCartao) VALUES (?, ?, ?)",
      ["Produtos de Barba ou Cabelo", "Recompensa", codigoCartao]
    );

    return rows.insertId;
  } catch (error) {
    console.error("Erro ao inserir recompensa dois:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function insertRewardThree(codigoCartao) {
  const connection = await connectToDatabase();

  try {
    const [rows] = await connection.execute(
      "INSERT INTO utilizaveis (Nome, Tipo, codigoCartao) VALUES (?, ?, ?)",
      ["Serviço Bônus", "Recompensa", codigoCartao]
    );

    return rows.insertId;
  } catch (error) {
    console.error("Erro ao inserir recompensa três:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = {
  insertRewardOne,
  insertRewardTwo,
  insertRewardThree,
};
