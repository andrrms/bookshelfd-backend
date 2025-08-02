import express from 'express';
import { connectDatabase, disconnectDatabase } from '@/database';
import config from '@/config';
import Logger from '@/utils/Logger';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';

const app = express();

app.use(express.json());
app.use(authRouter);
app.use(userRouter);

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      Logger.info(`Servidor rodando em ${config.api_url}`);
    });

    const gracefulShutdown = async (signal: string) => {
      Logger.verbose(`Recebido sinal ${signal}, encerrando servidor...`);

      server.close(async () => {
        Logger.verbose('Servidor HTTP encerrado');

        await disconnectDatabase();

        Logger.info('Processo finalizado com sucesso');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    Logger.error(`Erro ao inicializar o servidor: ${error}`);
    process.exit(1);
  }
};

startServer();
