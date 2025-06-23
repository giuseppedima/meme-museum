import { Request, Response, NextFunction } from "express";

export const validateId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params[paramName]);
    
    if (isNaN(id) || id <= 0) {
      return next({ 
        status: 400, 
        message: `Invalid ${paramName.charAt(0).toUpperCase() + paramName.slice(1)} ID` 
      });
    }
    
    req.params[paramName] = id.toString();

    next();
  };
};