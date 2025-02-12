import { Request, Response } from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

async function connectToDatabase() {
    return OracleDB.getConnection({
        user: "sys",
        password: "NICOLAS",
        connectString: "localhost:1521/XEPDB1",
        privilege: OracleDB.SYSDBA
    });
}

export namespace FinancialManager {
    export const addFunds = async (req: Request, res: Response): Promise<void> => {
        const { amount } = req.body; 
        const token = req.headers.authorization?.split(" ")[1]?.trim(); 
    
        console.log("Token recebido no cabeçalho:", req.headers.authorization);
        console.log("Token extraído:", token);
    
        if (!token) {
            res.status(401).json({ message: "Token não fornecido." });
            return;
        }
    
        try {
            const secretKey = "pi_auth";
            console.log("Chave secreta usada para validação:", secretKey);
    
            const decoded = jwt.verify(token, secretKey) as { id: number };
            console.log("Decodificação bem-sucedida do token:", decoded);
    
            const user_id = decoded.id;
    
            if (!amount || amount <= 0) {
                res.status(400).json({ message: "Valor inválido para adicionar fundos." });
                return;
            }
    
            let connection;
    
            try {
                connection = await connectToDatabase();
    
                const result = await connection.execute(
                    `INSERT INTO FUNDS (user_id, amount) VALUES (:user_id, :amount)`,
                    { user_id, amount },
                    { autoCommit: true }
                );
    
                console.log("Fundos adicionados com sucesso! Linhas afetadas:", result.rowsAffected);
                res.status(201).json({ message: "Fundos adicionados com sucesso!" });
            } catch (error) {
                console.error("Erro ao adicionar fundos:", error);
                res.status(500).json({ message: "Erro ao adicionar fundos." });
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (closeError) {
                        console.error("Erro ao fechar a conexão:", closeError);
                    }
                }
            }
        } catch (err) {
            console.error("Erro ao verificar o token:", err);
            res.status(403).json({ message: "Token inválido ou expirado." });
        }
    };

    export const withdrawFunds = async (req: Request, res: Response): Promise<void> => {
        const { amount, bankDetails } = req.body;
        const token = req.headers.authorization?.split(" ")[1]?.trim(); 
    
        if (!token) {
            res.status(401).json({ message: "Token não fornecido." });
            return;
        }
    
        try {
            const secretKey = "pi_auth";
            const decoded = jwt.verify(token, secretKey) as { id: number };
            const user_id = decoded.id;
    
            console.log(`Token decodificado com sucesso. ID do usuário: ${user_id}`);
    
            if (!amount || amount <= 0) {
                console.log(`Valor inválido para saque: ${amount}`);
                res.status(400).json({ message: 'Valor inválido para saque.' });
                return;
            }
    
            console.log(`Solicitação de saque recebida. Valor: R$ ${amount}, Detalhes Bancários: ${bankDetails}`);
    
            let connection;
    
            try {
                connection = await connectToDatabase();
                console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
               
                const result = await connection.execute(
                    `SELECT amount FROM FUNDS WHERE user_id = :user_id`,
                    { user_id }
                ) as { rows: [number[]] }; 
    
                console.log(result); 
    
               
                if (!result.rows?.length) {
                    console.log(`Nenhum valor encontrado para o usuário com ID: ${user_id}`);
                    res.status(400).json({ message: 'Usuário não encontrado ou saldo inexistente.' });
                    return;
                }
    
               
                const currentBalance = result.rows[0][0];
    
                if (currentBalance === undefined || typeof currentBalance !== 'number') {
                    console.log(`Saldo inválido recuperado: ${currentBalance}`);
                    res.status(500).json({ message: 'Erro ao recuperar o saldo do usuário.' });
                    return;
                }
    
                console.log(`Saldo atual do usuário (ID: ${user_id}): R$ ${currentBalance}`);
    
                if (currentBalance < amount) {
                    console.log(`Saldo insuficiente para a retirada. Tentativa de saque: R$ ${amount}, Saldo disponível: R$ ${currentBalance}`);
                    res.status(400).json({ message: 'Saldo insuficiente para a retirada.' });
                    return;
                }
    
                const newBalance = currentBalance - amount;
    
                console.log(`Processando saque... Novo saldo após o saque: R$ ${newBalance}`);
    
                await connection.execute(
                    `UPDATE FUNDS SET amount = :newBalance WHERE user_id = :user_id`,
                    { newBalance, user_id },
                    { autoCommit: true }
                );
    
                console.log(`Saque realizado com sucesso. Novo saldo: R$ ${newBalance}`);
                res.status(200).json({ message: 'Saque realizado com sucesso!' });
    
            } catch (error) {
                console.error('Erro ao processar o saque:', error);
                res.status(500).json({ message: 'Erro ao processar o saque.' });
            } finally {
                if (connection) {
                    await connection.close();
                    console.log('Conexão com o banco de dados fechada.');
                }
            }
        } catch (err) {
            console.error('Erro ao verificar o token:', err);
            res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
    };

    export const getBalance = async (req: Request, res: Response): Promise<void> => {
        const token = req.headers.authorization?.split(" ")[1]?.trim(); // Extrair o token do header de Authorization

        if (!token) {
            res.status(401).json({ message: "Token não fornecido." });
            return;
        }

        try {
            const secretKey = "pi_auth";
            const decoded = jwt.verify(token, secretKey) as { id: number };
            const user_id = decoded.id;

            console.log(`Token decodificado com sucesso. ID do usuário: ${user_id}`);

            let connection;

            try {
                connection = await connectToDatabase();
                console.log('Conexão com o banco de dados estabelecida com sucesso.');

                // Consultar o saldo do usuário
                const result = await connection.execute(
                    `SELECT amount FROM FUNDS WHERE user_id = :user_id`,
                    { user_id }
                ) as { rows: [number[]] };

                
                if (!result.rows?.length) {
                    console.log(`Nenhum saldo encontrado para o usuário com ID: ${user_id}`);
                    res.status(404).json({ message: 'Usuário não encontrado ou saldo inexistente.' });
                    return;
                }

               
                const currentBalance = result.rows[0][0];

                if (currentBalance === undefined || typeof currentBalance !== 'number') {
                    console.log(`Saldo inválido recuperado: ${currentBalance}`);
                    res.status(500).json({ message: 'Erro ao recuperar o saldo do usuário.' });
                    return;
                }

                console.log(`Saldo atual do usuário (ID: ${user_id}): R$ ${currentBalance}`);

                res.status(200).json({ balance: currentBalance });

            } catch (error) {
                console.error('Erro ao recuperar o saldo:', error);
                res.status(500).json({ message: 'Erro ao recuperar o saldo.' });
            } finally {
                if (connection) {
                    await connection.close();
                    console.log('Conexão com o banco de dados fechada.');
                }
            }
        } catch (err) {
            console.error('Erro ao verificar o token:', err);
            res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
    };
}

