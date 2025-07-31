# Integração do Prisma com o Servidor

## Visão Geral

A integração do Prisma foi configurada para garantir conexões seguras e um encerramento gracioso do servidor, seguindo as melhores práticas de desenvolvimento.

## Funcionalidades Implementadas

### 1. Conexão Automática
- O banco de dados é conectado automaticamente na inicialização do servidor
- Logs informativos indicam o status da conexão
- Em caso de erro na conexão, o processo é encerrado com código de erro

### 2. Configuração de Logs
- Em desenvolvimento: logs de query, error e warn
- Em produção: apenas logs de error
- Configuração baseada na variável de ambiente `NODE_ENV`

### 3. Graceful Shutdown
- O servidor escuta sinais `SIGTERM` e `SIGINT` (Ctrl+C)
- Encerramento ordenado:
  1. Para de aceitar novas conexões HTTP
  2. Finaliza conexões HTTP existentes
  3. Desconecta do banco de dados
  4. Encerra o processo

## Como Usar

### Iniciar o Servidor
```bash
npm run dev
```

### Parar o Servidor
- **Desenvolvimento**: `Ctrl+C` no terminal
- **Produção**: Enviar sinal SIGTERM para o processo

### Exemplo de Logs
```
✅ Conectado ao banco de dados com sucesso
🚀 Servidor rodando em http://localhost:3000

# Ao encerrar com Ctrl+C:
📞 Recebido sinal SIGINT, encerrando servidor...
🔌 Servidor HTTP encerrado
✅ Desconectado do banco de dados com sucesso
👋 Processo finalizado com sucesso
```

## Estrutura dos Arquivos

### `/src/database/index.ts`
- Configuração do cliente Prisma
- Funções de conexão e desconexão
- Export do cliente para uso em outros módulos

### `/src/server.ts`
- Configuração do servidor Express
- Integração com o banco de dados
- Implementação do graceful shutdown

## Uso do Cliente Prisma

Para usar o Prisma em outros módulos:

```typescript
import prisma from './database';

// Exemplo de uso
const users = await prisma.user.findMany();
```

## Variáveis de Ambiente

Certifique-se de ter configurado no arquivo `.env`:

```env
DATABASE_SQLITE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3000
```
