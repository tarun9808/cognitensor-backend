import { Sequelize } from "sequelize-typescript";
import { Umzug, SequelizeStorage } from 'umzug';
import "dotenv/config";
import { Dialect } from "sequelize/types";
import dbconfig from "../config/config.json";
import { logger } from "../libs/logger";
import path from "path";
import { User } from '../modules/user/models/user';
import { UserRole } from "../modules/user/models/userRole";
import { Role } from "../modules/user/models/role";
import { RolePermission } from "../modules/user/models/rolePermission"
import { ResetPassword } from "../modules/user/models/resetPassword";
import { Permission } from "../modules/user/models/permission";
import { Mis } from "../modules/mis/models/mis";

// define connection parameter
type dbconfigType = {
  [key: string]: {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
  };
};

// getting parameter from config.json
const config: dbconfigType = JSON.parse(JSON.stringify(dbconfig));
const env: string = process.env.NODE_ENV || "production";
// destructuring parameter
const { host, database, dialect, username, password } = config[env];

const sequelize = new Sequelize({
  host,
  database,
  dialect,
  dialectOptions: {
    multipleStatements: true,
  },
  username,
  password,
  logging: false,
  pool: {
    max: 10000,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
  },
});

// authenticate db connection
export const initDB = async () => {
  try {
    console.log("Database initDB");
    await sequelize.authenticate();
  } catch (error) {
    logger.error("Error in authenticating database => ", error);
  }
};

export const runMirgrationSeederMYSQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully ( DB ) .");
    //logger.info('Migration start running .')
    // await migrate.up();
    //logger.info('All migrations performed successfully ( DB )')
    // await seed.up();
    //logger.info('Data seed successfull. ( DB )')
    return Promise.resolve();
  } catch (error) {
    logger.error("Error in running migration", error);
  }
};


// adding models to sequelize
sequelize.addModels([User, UserRole, Role,RolePermission,Permission, ResetPassword,Mis]);
const models = {
  User,
  UserRole,
  Role,
  RolePermission,
  ResetPassword,
  Permission,
  Mis
 }

export { sequelize, models, User, Role,RolePermission,ResetPassword,Permission,Mis};

export { sequelize as databaseInstance }
 



const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
 
(async () => {
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  await umzug.up();
})();