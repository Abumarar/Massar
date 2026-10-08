import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateRequest = (schemas: { body?: any; query?: any; params?: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        Object.defineProperty(req, "params", {
          value: parsedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === "ZodError") {
        res.status(400).json({
          error: "Validation error",
          details: error.issues ?? error.errors ?? [error.message],
        });
        return;
      }
      next(error);
    }
  };
};
