import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  dbConnectionUri: string;
  dialect: string;
  tokenSecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbConnectionUri: process.env.DB_CONNECTION_URI || 'sqlite:database.db',
  dialect: process.env.DIALECT || 'sqlite',
  tokenSecret: process.env.TOKEN_SECRET || 'V3RY_S3CR37_T0K3N',
};

export default config;