import { Response } from 'express';
import { AuthenticateJwtToken } from './GeneralFunctions';

export function AuthenticateTokenMiddle(req, res: Response<any>, next) {
    const authHeader = req.headers['authorization'];
    const token1 = authHeader && authHeader.split(' ')[1];
    if (token1 == null) return res.sendStatus(401);
    AuthenticateJwtToken(token1)
      .then((user) => {
        res.locals.user = user;
        next();
      })
      .catch((e) => {
        res.status(403).send(e);
      });
  }

  