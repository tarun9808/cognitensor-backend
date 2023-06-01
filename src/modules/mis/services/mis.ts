import { Request, Response } from "express";;
import sequelize, { Op } from "sequelize";
import { databaseInstance, User } from "../../../config/db";
import { paginator } from "../../../libs/pagination";
import Exception from "../../../middlewares/resp-handler/exception";
import BaseService from '../../../core/services/base';
var constant = require('../../../middlewares/resp-handler/constants');
import { Sequelize, QueryTypes} from "sequelize";
export class MisService extends BaseService {
    constructor({ model, models, logger,client }: any) {
      super({ model, models, logger,client });
    }


    async readAllData(req: Request, client:any) {

        try {
          let where = {}
          let {
            report_type,
            sortBy,
            search,
            sortOrder,
            to,
            from,
            limit
          } = req.query
          this.logger.error("limit=>",limit,report_type);
          let query = paginator(req.query, ['report_type', 'name', 'data1', 'data2', 'data3', 'data4', 'data5','createdAt', 'updatedAt'])
          if (undefined == sortBy) { sortBy = 'name' }
          if (undefined == sortOrder) { sortOrder = 'ASC' }
    
          query.order =  [[String(sortBy), String(sortOrder)]]
          if(to != undefined) {
            where = from?{
                ...where,
                updatedAt: {
                    [Op.between]: [from, to]
                }
            } : { ...where,
              updatedAt: {
                  [Op.lte]: to
              }}
          }
          
          if (report_type != undefined) {
            where = {
              ...where,
              report_type: {
                [Op.eq]: report_type,
              },
            }
          }
          
          var reportData:any = await this.model.findAndCountAll({
            where: {
              ...query.where,
              ...where
            },
            limit: query.limit,
            distinct: true,
            offset: query.offset,
            order: query.order,
          })
          let finalResponse =
          {
            count: reportData.count,
            rows: reportData,
          }
          //client.set(report_type, finalResponse);
          return Promise.resolve(finalResponse)
        } catch (error: any) {
          this.logger.error("Error at readAllData ", error.message);
          return Promise.reject(error.message)
    
        }
      }

      // distinct report type
      async reportType(req: Request) {
       try {
    
          let reportData=   this.model.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('report_type')), 'report_type']]
       })
        
          //client.set(report_type, finalResponse);
          return Promise.resolve(reportData)
        } catch (error: any) {
          this.logger.error("Error at Distinct Report Type ", error.message);
          return Promise.reject(error.message)
    
        }
      }

      // create data
      async createData(req: Request) {
        const _transaction = await databaseInstance.transaction();
        try {
          const { report_type,name, data1, data2, data3, data4, data5}: any = req.body || req;
          const misResponse = await this.model.create(req.body, { transaction: _transaction })
          await _transaction.commit();
    
          let finalResponse: any =
          {
            count: misResponse.length,
            rows: misResponse,
          }
          return Promise.resolve(finalResponse)
        }
        catch (err: any) {
          await _transaction.rollback();
          this.logger.error("Error at creating mis data ", err);
          return Promise.reject(err.message)
    
        }
      }

      


}