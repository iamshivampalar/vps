import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let sequelize;

if (process.env.DB_DIALECT === 'mysql' || (process.env.DB_HOST && process.env.DB_USER)) {
  console.log('Connecting to MySQL 8 database...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'internspace_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('No MySQL configuration found. Falling back to local SQLite3 database for seamless sandboxed execution...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: false
  });
}

export default sequelize;
