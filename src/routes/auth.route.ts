import { DecodedJwtToken } from '@/types/auth';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(3, 'Senha deve ter pelo menos 6 caracteres'),
});

const authRouter: Router = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: z.treeifyError(parseResult.error) });
  }

  const { email, password } = parseResult.data;

  // Exemplo: autenticação fake (substitua por consulta ao banco de dados)
  if (email !== 'admin@example.com' || password !== '123') {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const jwtPayload: DecodedJwtToken = {
    id: 1,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    process.env.JWT_SECRET ?? 'default_secret',
    {
      expiresIn: '1h',
    },
  );

  return res.json({ accessToken });
});

export default authRouter;
