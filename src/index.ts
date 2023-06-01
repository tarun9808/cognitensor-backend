import http from 'http'
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { initDB,models } from "./config/db";
import cors from 'cors';
import bodyParser from 'body-parser';
import { logger } from './libs/logger/index';
import { misRoutes } from './modules/mis/routes';
const redis = require('redis');
dotenv.config();
const REDIS_PORT:any = process.env.REDIS_PORT;

const app: Express = express();
const client:any = redis.createClient(REDIS_PORT);
const port = process.env.PORT;

var corsOptions = {
    origin:  process.env.ALLOWURL?.split(',') ,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`Server Running on port : ${port}`)
  })

misRoutes({ app, models, logger, client});
// Create the HTTP Express Server
const server = http.createServer(app);
// Initialize sequelize connection
initDB().then(async (res: any) => {
  console.log('after connection..');
  // call seeder or migration
    
});

try{
    server.listen(port, () => {
      logger.info('listening on ', port);
    });
  }catch(error:any){
   logger.error("error in listening port.",error)
  }