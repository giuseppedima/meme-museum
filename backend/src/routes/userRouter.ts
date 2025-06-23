import express, { Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";

export const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     description: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
userRouter.get("/users", (req: Request, res: Response, next: NextFunction) => {
  UserController.getUsers()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      next(err);
    });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: Unique user ID
 *         username:
 *           type: string
 *           example: "john_doe"
 *           description: Username
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-23T10:30:00.000Z"
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-23T10:30:00.000Z"
 *           description: Last update timestamp
 */