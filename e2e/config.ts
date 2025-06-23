import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  dbConnectionUri: string;
  dialect: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 4200,
  dbConnectionUri: process.env.DB_CONNECTION_URI || 'sqlite:database.db',
  dialect: process.env.DIALECT || 'sqlite',
};

export default config;