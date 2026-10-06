import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateRequest = (schemas: { body?: any; query?: any; params?: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === "ZodError") {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
