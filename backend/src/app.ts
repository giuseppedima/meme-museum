import express from "express";
import morgan from "morgan";
import cors from "cors";
import perfectExpressSanitizer from "perfect-express-sanitizer";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import { memeRouter } from "./routes/memeRouter";
import { authenticationRouter } from "./routes/authenticationRouter";

import { errorHandler } from './middlewares/errorHandler';
import { userRouter } from "./routes/userRouter";
import path from "path";

const app = express();

// Register the morgan logging middleware, use the 'dev' format
app.use(morgan('dev'));

app.use(cors()); //API will be accessible from anywhere.

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Parse incoming requests with a JSON payload
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({extended: true}));

// Sanitize input to prevent XSS attacks
app.use((req, res, next) => {
  // Salta il sanitizer per le route di upload
  if (req.path === '/memes' && req.method === 'POST') {
    next();
  } else {
    perfectExpressSanitizer.clean({
      xss: true,
      noSql: true,
      sql: true,
    })(req, res, next);
  }
});

//generate OpenAPI spec and show swagger ui
// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'MemeMuseum REST API',
      version: '1.0.0',
    },
  },
  apis:   [
    path.join(__dirname, './routes/*Router.js'),
  ], // files containing annotations
});

console.log('Swagger spec paths found:', Object.keys((swaggerSpec as any).paths || {}));


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//define routes
app.use(authenticationRouter);
app.use(userRouter)
app.use(memeRouter);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;