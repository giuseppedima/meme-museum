import express, { Response, NextFunction } from "express";
import { MemeController } from "../controllers/MemeController";
import { enforceAuthentication, optionalAuthentication, ensureUsersModifyOnlyOwnMemes, ensureUsersModifyOnlyOwnComments } from "../middlewares/authorization";
import { AuthenticatedRequest } from "../types/requests";
import upload from "../middlewares/multer";
import { CommentController } from "../controllers/CommentController";
import { validateId } from "../middlewares/validateId";

export const memeRouter = express.Router();

/**
 * @swagger
 * /memes:
 *   get:
 *     description: Get memes with optional filtering and pagination
 *     tags:
 *       - Memes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by meme title
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (JSON array string)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: upload_date
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: List of memes with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meme'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
memeRouter.get("/memes", optionalAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // req.user sarà popolato se l'utente è autenticato, altrimenti sarà undefined
  const userId = req.user?.id;
  
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  // Estrai i parametri di query
  const filters = {
    title: req.query.title ? (req.query.title as string) : undefined,
    userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
    tags: req.query.tags ? JSON.parse(req.query.tags as string) : undefined,
    sortBy: req.query.sortBy as string || 'upload_date',
    sortOrder: req.query.sortOrder as string || 'desc',
    dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
    dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
  };
  
  MemeController.getMemes(undefined, userId, filters, page, pageSize).then(result => {
    res.json(result);
  }).catch(err => {
    next(err);
  });
});

/**
 * @swagger
 * /memes:
 *   post:
 *     description: Create a new meme
 *     tags:
 *       - Memes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Funny Cat Meme"
 *                 description: Meme title
 *               meme:
 *                 type: string
 *                 format: binary
 *                 description: Meme image file
 *               tags:
 *                 type: string
 *                 example: '["funny", "cat", "animal"]'
 *                 description: Tags as JSON array string
 *             required:
 *               - title
 *               - meme
 *               - tags
 *     responses:
 *       200:
 *         description: Meme created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meme'
 *       400:
 *         description: Bad request - missing required fields or invalid format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
memeRouter.post("/memes", enforceAuthentication, upload.single('meme'), (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

  if(!req.user) {
    next({status: 401, message: "Unauthorized"});
    return;
  }
  if(!req.body.title) {
    next({status: 400, message: "Title is required"});
    return;
  }
  if(!req.file) {
    next({status: 400, message: "Meme file is required"});
    return;
  }
  if(!req.body.tags) {
    next({status: 400, message: "Tags are required"});
    return;
  }
  // Parsa i tags da stringa JSON ad array
  let parsedTags;
  try {
    parsedTags = JSON.parse(req.body.tags);
  } catch (error) {
    next({status: 400, message: "Invalid tags format"});
    return;
  }
  if(parsedTags.length === 0) {
    next({status: 400, message: "At least one tag is required"});
    return;
  }
  MemeController.createMeme(req.body.title, req.file.filename, parsedTags, req.user.id).then( result => {
    res.json(result);
  }).catch(err => {
    next({status: 500, message: err.message || "Internal Server Error"});
  });
});

/**
 * @swagger
 * /memes/daily:
 *   get:
 *     description: Get today's featured meme
 *     tags:
 *       - Memes
 *     responses:
 *       200:
 *         description: Today's meme
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meme'
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
memeRouter.get('/memes/daily', optionalAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  
  MemeController.getTodaysMeme(userId).then(meme => {
    if (meme) {
      res.json(meme);
    } else {
      next({status: 404, message: "Meme not found"});
    }
  }).catch(err => {
    next(err);
  });
});

/**
 * @swagger
 * /memes/{memeId}:
 *   get:
 *     description: Get a specific meme by ID
 *     tags:
 *       - Memes
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *     responses:
 *       200:
 *         description: Meme details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meme'
 *       400:
 *         description: Invalid meme ID
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
memeRouter.get("/memes/:memeId", validateId('memeId'), optionalAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const memeId = parseInt(req.params.memeId);
  
  MemeController.findById(memeId, userId).then(meme => {
    if (meme) {
      res.json(meme);
    } else {
      next({status: 404, message: "Meme not found"});
    }
  }).catch(err => {
    next(err);
  });
});

/**
 * @swagger
 * /memes/{memeId}/vote:
 *   post:
 *     description: Vote on a meme (upvote or downvote)
 *     tags:
 *       - Memes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [upvote, downvote]
 *                 example: upvote
 *                 description: Vote type
 *             required:
 *               - type
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meme'
 *       400:
 *         description: Invalid vote type or meme ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
memeRouter.post("/memes/:memeId/vote", validateId('memeId'), enforceAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if(!req.user) {
    next({status: 401, message: "Unauthorized"});
    return;
  }
  if(!req.body.type) {
    next({status: 400, message: "Vote type is required"});
    return;
  }
  if (req.body.type !== 'upvote' && req.body.type !== 'downvote') {
    next({status: 400, message: "Invalid vote type"});
    return;
  }
  MemeController.vote(parseInt(req.params.memeId), req.user.id, req.body.type).then((item) => {
    if(item)
      res.json(item);
    else 
      next({status: 404, message: "Meme not found"});
  }).catch(err => {
    next({status: 500, message: err.message || "Internal Server Error"});
  });
});

/**
 * @swagger
 * /memes/{memeId}:
 *   delete:
 *     description: Delete a meme (only by owner)
 *     tags:
 *       - Memes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *     responses:
 *       200:
 *         description: Meme deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Meme deleted successfully"
 *       400:
 *         description: Invalid meme ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
memeRouter.delete("/memes/:memeId", validateId('memeId'), enforceAuthentication, ensureUsersModifyOnlyOwnMemes, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const memeId = parseInt(req.params.memeId);
  MemeController.delete(memeId).then( (item) => {
    if(item)
      res.json(item);
    else 
      next({status: 404, message: "Meme not found"});
  }).catch( err => {
    next(err);
  })
});

/**
 * @swagger
 * /memes/{memeId}:
 *   put:
 *     description: Update a meme (only by owner)
 *     tags:
 *       - Memes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Meme Title"
 *                 description: New meme title
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["funny", "updated", "meme"]
 *                 description: Updated tags array
 *     responses:
 *       200:
 *         description: Meme updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meme'
 *       400:
 *         description: Invalid request - bad meme ID or tags format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner
 *       404:
 *         description: Meme not found
 *       500:
 *         description: Internal server error
 */
memeRouter.put("/memes/:memeId", validateId('memeId'), enforceAuthentication, ensureUsersModifyOnlyOwnMemes, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const memeId = parseInt(req.params.memeId);

  let title:string|undefined = undefined;
  let tags:string[]|undefined = undefined;
  if (req.body.title) {
    title = req.body.title;
  }

  if (req.body.tags) {
    if(!Array.isArray(req.body.tags)) {
      next({ status: 400, message: "Tags must be an array" });
      return;
    }
    if (req.body.tags.length === 0) {
      next({ status: 400, message: "At least one tag is required" });
      return;
    }
    tags = req.body.tags;
  }

  MemeController.update(memeId, title, tags).then( (item) => {
    if(item)
      res.json(item);
    else 
      next({status: 404, message: "Meme not found"});
  }).catch( err => {
    next(err);
  })
});

/**
 * @swagger
 * /memes/{memeId}/comments:
 *   get:
 *     description: Get comments for a specific meme
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: List of comments with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *       400:
 *         description: Invalid meme ID
 *       500:
 *         description: Internal server error
 */
memeRouter.get("/memes/:memeId/comments", validateId('memeId'), optionalAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const memeId = parseInt(req.params.memeId);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  CommentController.getCommentsByMemeId(memeId, page, pageSize).then(result => {
    res.json(result);
  }).catch(err => {
    next(err);
  });
});

/**
 * @swagger
 * /memes/{memeId}/comments:
 *   post:
 *     description: Add a comment to a meme
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a great meme!"
 *                 description: Comment content
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - missing content or invalid meme ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
memeRouter.post("/memes/:memeId/comments", validateId('memeId'), enforceAuthentication, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if(!req.user) {
    next({status: 401, message: "Unauthorized"});
    return;
  }
  if(!req.body.content) {
    next({status: 400, message: "Content is required"});
    return;
  }
  const memeId = parseInt(req.params.memeId);
  CommentController.createComment( req.body.content, req.user.id, memeId).then(comment => {
    res.json(comment);
  }).catch(err => {
    next({status: 500, message: err.message || "Internal Server Error"});
  });
});

/**
 * @swagger
 * /memes/{memeId}/comments/{commentId}:
 *   put:
 *     description: Update a comment (only by owner)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *                 description: New comment content
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - missing content or invalid IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner
 *       500:
 *         description: Internal server error
 */
memeRouter.put("/memes/:memeId/comments/:commentId", validateId('memeId'), validateId('commentId'), enforceAuthentication, ensureUsersModifyOnlyOwnComments, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if(!req.user) {
    next({status: 401, message: "Unauthorized"});
    return;
  }
  const commentId = parseInt(req.params.commentId);
  if(!req.body.content) {
    next({status: 400, message: "Content is required"});
    return;
  }
  CommentController.updateComment(commentId, req.body.content).then(comment => {
    res.json(comment);
  }).catch(err => {
    next({status: 500, message: err.message || "Internal Server Error"});
  });
});

/**
 * @swagger
 * /memes/{memeId}/comments/{commentId}:
 *   delete:
 *     description: Delete a comment (only by owner)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meme ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       400:
 *         description: Invalid meme ID or comment ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
memeRouter.delete("/memes/:memeId/comments/:commentId", validateId('memeId'), validateId('commentId'), enforceAuthentication, ensureUsersModifyOnlyOwnComments, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if(!req.user) {
    next({status: 401, message: "Unauthorized"});
    return;
  }
  const commentId = parseInt(req.params.commentId);
  CommentController.deleteComment(commentId).then(deleted => {
    if (deleted) {
      res.json({ message: "Comment deleted successfully" });
    } else {
      next({ status: 404, message: "Comment not found" });
    }
  }).catch(err => {
    next({status: 500, message: err.message || "Internal Server Error"});
  });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Meme:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Funny Cat Meme"
 *         image:
 *           type: string
 *           example: "meme_12345.jpg"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["funny", "cat", "animal"]
 *         userId:
 *           type: integer
 *           example: 1
 *         upvotes:
 *           type: integer
 *           example: 42
 *         downvotes:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: "This is a great meme!"
 *         userId:
 *           type: integer
 *           example: 1
 *         memeId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */