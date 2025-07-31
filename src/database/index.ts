import config from '@/config';
import { PrismaClient } from './generated/prisma';
import Logger from '@/utils/Logger';

const prisma = new PrismaClient({
  log: config.node_env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Função para conectar ao banco
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    Logger.verbose('Conectado ao banco de dados com sucesso');
  } catch (error) {
    Logger.error(`Erro ao conectar com o banco de dados: ${error}`);
    process.exit(1);
  }
};

// Função para desconectar do banco
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    Logger.verbose('Desconectado do banco de dados com sucesso');
  } catch (error) {
    Logger.error(`Erro ao desconectar do banco de dados: ${error}`);
  }
};

export default prisma;
export * from './generated/prisma';
