import { Request, Response } from "express";
import BaseController from '../../../core/controllers/base';
import { respHndlr } from "../../../middlewares/resp-handler";
import { Mis } from "../models/mis";
import { MisService } from "../services/mis";
var constant = require('../../../middlewares/resp-handler/constants')

export class MisController extends BaseController{
  constructor({logger, models,client}:any){
    super({
      service: new MisService({model:Mis, logger, models,client}),
      model: Mis,
      models,
      logger,
      client
    })
  }


  async readAllData(req: Request, res: Response,client:any) {
    this.service.readAllData(req,client).then((result: any) => {
      respHndlr.sendSuccess(res, result, constant.RESPONSE_STATUS.SUCCESS);
    })
      .catch((err: any) => {
        respHndlr.sendError(res, err);
      });

  }
  async create(req: Request, res: Response) {
    this.service.createData(req).then((result: any) => {   
      respHndlr.sendSuccess(res, result, constant.RESPONSE_STATUS.SUCCESS_CREATED);
    }).catch((err: any) => {
        respHndlr.sendError(res, err);
      });

  }
  /// distinct report type
  async fetchReportType(req: Request, res: Response) {
    this.service.reportType(req).then((result: any) => {   
      respHndlr.sendSuccess(res, result, constant.RESPONSE_STATUS.SUCCESS_CREATED);
    }).catch((err: any) => {
        respHndlr.sendError(res, err);
      });

  }
}