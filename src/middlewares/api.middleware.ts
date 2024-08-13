import type { Request, Response, NextFunction } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization === process.env.THIRD_PARTY_PSK) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized origin" });
  }
};

export const isAuthenticatedCSRF = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    req.session.skipCSRF = true;
  } else {
    req.session.skipCSRF = false;
  }
  next();
};