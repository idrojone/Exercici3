import jwt, { type Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret | undefined = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Asegúrate de tener .env con JWT_SECRET y que dotenv se carga antes.');
}

export function signToken(payload: object) {
  const signer: any = jwt.sign;
  return signer(payload, JWT_SECRET as any, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string) {
  const verifier: any = jwt.verify;
  return verifier(token, JWT_SECRET as any);
}

export default { signToken, verifyToken };
