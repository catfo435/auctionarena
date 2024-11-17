import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.OAUTH_CID);

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ authenticated: false, message: 'No token found' });
    return;
  }

  client.verifyIdToken({
    idToken: token,
    audience: process.env.OAUTH_CID,
  })
  .then((ticket) => {
    const { email } = ticket.getPayload()!
    res.locals = { email }
    next();
  })
  .catch(() => {
    res.status(440).json({ authenticated: false, message: 'Invalid or expired token' });
  });
};