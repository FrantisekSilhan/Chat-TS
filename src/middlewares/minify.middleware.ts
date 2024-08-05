import type { Request, Response, NextFunction } from "express";

export const shouldMinify = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.includes("minify=false")) {
    res.locals.minify = false;
    return next();
  }
  res.locals.minify = true;
  next();
}

export default shouldMinify;