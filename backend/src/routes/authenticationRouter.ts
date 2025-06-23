import express, { Request, Response, NextFunction } from "express";

import { AuthController } from "../controllers/AuthController";

export const authenticationRouter = express.Router();

/**
 * @swagger
 *  /auth:
 *    post:
 *      description: Authenticate user
 *      tags:
 *        - Authentication
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: user credentials to authenticate
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: Kyle
 *                pwd:
 *                  type: string
 *                  example: p4ssw0rd
 *              required:
 *                - usr
 *                - pwd
 *      responses:
 *        200:
 *          description: User authenticated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  token:
 *                    type: string
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *        400:
 *          description: Bad request, missing username or password
 *        401:
 *          description: Invalid credentials
 *        500:
 *          description: Internal server error, could not authenticate user
 */
authenticationRouter.post("/auth", async (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.usr || !req.body.pwd){
    next({status: 400, message: "Username and password are required"});
    return;
  }
  let user = await AuthController.checkCredentials(req.body.usr, req.body.pwd);
  if(user){
    res.json(AuthController.issueToken(user));
  } else {
    next({status: 401, message: "Invalid credentials. Try again."});
  }
});

/**
 * @swagger
 *  /signup:
 *    post:
 *      description: Create a new user account
 *      tags:
 *        - Authentication
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: User credentials for new account
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: newuser
 *                  description: Username for the new account
 *                pwd:
 *                  type: string
 *                  example: securepassword123
 *                  description: Password for the new account
 *              required:
 *                - usr
 *                - pwd
 *      responses:
 *        200:
 *          description: User created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                    description: Unique user ID
 *                  usr:
 *                    type: string
 *                    example: newuser
 *                    description: Username
 *                  createdAt:
 *                    type: string
 *                    format: date-time
 *                    example: "2025-06-23T10:30:00.000Z"
 *                    description: Account creation timestamp
 *                  updatedAt:
 *                    type: string
 *                    format: date-time
 *                    example: "2025-06-23T10:30:00.000Z"
 *                    description: Last update timestamp
 *        400:
 *          description: Bad request, missing username or password
 *        500:
 *          description: Internal server error - Username already exists or database error
 */
authenticationRouter.post("/signup", (req: Request, res: Response, next: NextFunction) => {
  if(!req.body.usr || !req.body.pwd){
    next({status: 400, message: "Username and password are required"});
    return;
  }
  AuthController.createUser(req.body.usr, req.body.pwd).then((user) => {
    res.json({
      id: user.id,
      usr: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }).catch((err) => {
    if(err.name === "SequelizeUniqueConstraintError")
      next({status: 500, message: "Username already exists. Please choose a different username."});
    else
      next({status: 500, message: "Could not save user: " + err.message});
  })
});