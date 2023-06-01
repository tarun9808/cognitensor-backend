import { Request, Response } from 'express';
import { MisController } from '../controllers/miscontroller';
import { config } from '../../../config';

export const misRoutes = ({ app, logger, models, client}: any) => {
  try{
  const misController = new MisController({ logger, models});

    //read All the user from the data base
    app.get(`${config.API_PREFIX}/mis`, (req: Request, res: Response) => {
        misController.readAllData(req, res,client);
    });
    
    // API for Create User 
    app.post(`${config.API_PREFIX}/mis`, (req: Request, res: Response) => {
        misController.create(req, res);
    });
    app.get(`${config.API_PREFIX}/report-type`, (req: Request, res: Response) => {
        misController.fetchReportType(req, res);
    });

    
  
  }
  catch(error:any)
  {
    logger.error("error occure in mis routes.",error)
  }

  function redisCache(req:any, res:any, next:any) {
    const org = req.query.report_type;
    client.get(org, function (err:any, data:any) {
        if (err) throw err;

        if (data != null) {
            console.log("Data from redis");
            res.send(org, data);
        } else {
            next();
        }
    });
}
}
