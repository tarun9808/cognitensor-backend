import { Request, Response } from "express";;
import sequelize, { Op } from "sequelize";
import { databaseInstance, User } from "../../../config/db";
import { paginator } from "../../../libs/pagination";
import Exception from "../../../middlewares/resp-handler/exception";
import BaseService from '../../../core/services/base';
import { createHashedPassword } from "./passwordEncryption";
var constant = require('../../../middlewares/resp-handler/constants');
var userConstant = require('../utils/constant')
import { sendUserInvite } from "./sendInvite";
var fs = require("fs");

const storage: any = process.env.AZURE_STORAGE_CONNECTION_STRING



export class UserService extends BaseService {
  constructor({ model, models, logger }: any) {
    super({ model, models, logger });
  }



  // Insert UserRole values
  async insertUserRole(req: any, userId: any, roleName: any, isPlatformRole: any,) {
    const _transaction = await databaseInstance.transaction()
    try {
      let {
        roleId,
      } = req.body
        
      let deletedSite :any= []
      let userRoleBody = {roleId, userId, roleName,isPlatformRole ,deletedSite}
      let userRoleInfo = await this.models.UserRole.create(userRoleBody, { transaction: _transaction })
      userRoleInfo.save()
      await _transaction.commit()
      return Promise.resolve(userRoleInfo)
    } catch (err:any) {
      await _transaction.rollback()
      this.logger.error("Error in Creating User Role",err.message)
      return Promise.reject(err.message)
    }
  }

  //Update UserRole 
  async updateUserRole(req: any, userId: any, roleName: any, isPlatformRole: any,) {
    const _transaction = await databaseInstance.transaction()
    try {
      let {
        roleId,
      } = req
      let deletedSite :any= []
      let userRoleBody = { roleId, userId, roleName, isPlatformRole,deletedSite}
      let userRoleInfo = await this.models.UserRole.update(userRoleBody, {
        fields: Object.keys(userRoleBody),
        where: { userId: userId },
        transaction: _transaction
      })
      await _transaction.commit()
      return Promise.resolve(userRoleInfo)
    } catch (err:any) {
      await _transaction.rollback()
      this.logger.error("Error in Creating User Role",err.message)
      return Promise.reject(err.message)
    }
  }

  // Create User Service 
  async create(req: any) {
    const _transaction = await databaseInstance.transaction()
    const {
      name,
      username,
      email,
      roleId,
      gender,
      contact,
      imageUrl,
    } = req.body 
    try {
      // check for User Exist
      let isPlatformRole
      let userExist = await this.model.findOne({
        where: {
          [Op.and]: [sequelize.where(sequelize.fn('upper', sequelize.col('username')), username.toUpperCase())]
        },
        paranoid: false,
        transaction: _transaction
      })
      if (userExist) { throw new Exception(constant.ERROR_TYPE.ALREADY_EXISTS, `Entered Username already exists !`,) }

      // check for Email Exist 
      let userEmail = await this.model.findOne({ where: { email: email }, paranoid: false, transaction: _transaction })
      if (userEmail) { throw new Exception(constant.ERROR_TYPE.ALREADY_EXISTS, `Entered Email already exists !`,) }

      //check for the  Role Exist
      let roleExist = await this.models.Role.findOne({ where: { id: roleId }, paranoid: false, transaction: _transaction })
      if(!req.body.seeder){if(roleExist?.name === userConstant.SUPER_ADMIN) throw new Exception(constant.ERROR_TYPE.BAD_REQUEST, `User can not be created with role Platform Super Admin`,)}
      if (roleExist == null) throw new Exception(constant.ERROR_TYPE.BAD_REQUEST, `No role found for role Id ${roleId}`,)
     
      if (roleExist.isPlatformRole === true) {
        isPlatformRole = true
      } else {
        isPlatformRole = false
      }
      
      
     
      let password = createHashedPassword(userConstant.DEFAULT_PASSWORD)
      let status = userConstant.STATUS
      // if(roleExist?.name === userConstant.OperatorRole){
      //   status = userConstant.active
      // }
      var emailVerifiedAt = null

      // Create function 
      let userBody = { name, username, password, email, imageUrl, gender, contact, status }
      let user: any = await this.model.create(userBody, { transaction: _transaction })
      let userData = await user.save({ transaction: _transaction })
      //userRole creation
      let tenantRole = await this.insertUserRole(req, userData.id, roleExist.name, isPlatformRole,)
     
      await user.save({ transaction: _transaction })

      // User Response
      let userResponseData = { userData, tenantRole }
      let responseData : any = await this.CreateUserResponse(userResponseData)      

      // Send Invite
      // let payload, template
      let sentMail = await sendUserInvite(responseData, _transaction)
      
      await _transaction.commit()

      // prepare user data to sync
      if(responseData) {
        let syncUserData = {...responseData}
        const {id: userId, ...fields} = syncUserData;
        syncUserData = {
          ...fields,
          userId,
          name,
          username,
          email,
          password,
        }        
              // To notify the Device Manager
      }
      return Promise.resolve(responseData)

    } catch (err:any) {
      await _transaction.rollback()
      this.logger.error("Error in creating User",err.message)
      return Promise.reject(err.message)
    }
  }

  // Read User Service
  async readOne(req: any) {
    let id = req?.params?.id || req
    try {
      var user = await this.model.findOne({
        where: {
          id: id
        },
        attributes: {exclude: ['password']},
        include: [
          {
            model: this.models.UserRole
          }
        ],
      })
      if (!user) {
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND, `User with Id ${id} not found`)
      }
      let response = await this.ReadUserResponse(user)
      return Promise.resolve(response)
    } catch (err:any) {
      this.logger.error("Error in Finding the User",err.message)
      return Promise.reject(err.message)
    }
  }

  //Read All User Service 
  async readUser(req: Request) {
    try {
      let {
        role,
        site,
        status,
        sortBy,
        sortOrder,
        to,
        from
      } = req.query
    
    
      let query = paginator(req.query, ['name','username','createdAt','updatedAt'])
      if (undefined == sortBy) { sortBy = 'name' }
      if (undefined == sortOrder) { sortOrder = 'ASC' }

      if(sortBy === 'roleName'){
        query.order = [[ { model: this.models.UserRole, as: 'userRole' } ,(sortBy), (sortOrder)]]
      }
      else{
        query.order =  [[String(sortBy), String(sortOrder)]]
      }
      
      let where = {}
      let WhereUR= {}
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
      if (status != undefined) {
        where = {
          ...where,
          status: {
            [Op.eq]: status,
          },
        }
      }
      if (site != undefined) {
        WhereUR = {
          ...WhereUR,
          siteId: {
            [Op.like]: '%' + site + '%',
          },
        }
      }
     
      if (role != undefined) {
        WhereUR = {
          ...WhereUR,
          roleId: {
            [Op.eq]:role,
          },
        }
      }
     
      let attribute
      if(to != undefined){
        attribute = {exclude: ['']}
      }else{
        attribute = {exclude: ['password']}
      }
      
      
      let userData = await this.model.findAndCountAll({
        where: {
          ...query.where,
          ...where,
        },
        limit: query.limit,
        distinct: true,
        offset: query.offset,
        order: query.order,
        attributes: attribute,
        include: [
          {
            model: this.models.UserRole,
            where:WhereUR
          },
        ],
      })
      // let userDataArr: any = []
      // for (let i of userData.rows) {
      //   let response = await this.ReadUserResponse(i)
      //   userDataArr.push(response)
      // }
     
      return Promise.resolve(userData)
    } catch (err:any) {
      this.logger.error('Error in Read User',err.message)
      return Promise.reject(err.message)
    }
  }

  //Update User Service
  async update(req: Request) {
    let _transaction = await databaseInstance.transaction()
    try {
      let {
        name,
        username,
        email,
        gender,
        contact,
        imageUrl,
        status,
        roleId,
      } = req.body
      let userId = req.params.id
      var user = await this.model.findOne({
        where: { id: userId },
        include: [
          {
            model: this.models.UserRole
          }
        ],
        transaction: _transaction
      })

      let datauser = user
      if (user == null)
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND, `User not found for id ${userId}`,)
      // username Cannot Update
      if (username) { throw new Exception(constant.ERROR_TYPE.BAD_REQUEST, `Username can not be update`,) }
      //Check for Email
      if (email != null) {
        let existingEmail = await this.model.findOne({
          where: {
            email: {
              [Op.eq]: email,
            },
            id: { [Op.ne]: userId }
          },
          transaction: _transaction
        })
        if (existingEmail) { throw new Exception(constant.ERROR_TYPE.ALREADY_EXISTS, `Entered Email already exists !`,) }
      }
      let updateUserBody = {
        name: name !== undefined ? name : datauser.name,
        gender: gender !== undefined ? gender : datauser.gender,
        imageUrl: imageUrl !== undefined ? imageUrl : datauser.imageUrl,
        status: status !== undefined ? status : datauser.status,
        contact: contact !== undefined ? contact : datauser.contact,
        email: email !== undefined ? email : datauser.email,
      }
      let tenantRole: any
      if (roleId) {
        let isPlatformRole 
        let roleExist = await this.models.Role.findOne({ where: { id: roleId }, paranoid: false, transaction: _transaction })
          if (roleExist == null) throw new Exception(constant.ERROR_TYPE.BAD_REQUEST, `No role found for role Id ${roleId}`,)
          if (roleExist.isPlatformRole === true) {
            isPlatformRole = true
          } else {
            isPlatformRole = false
          }
       
        let roleName = roleExist?.name
        let userRoleObj = {
          roleId,
        }
        tenantRole = await this.updateUserRole(userRoleObj, userId, roleName, isPlatformRole)
      }
      let uaerUpdaate = await this.model.update(updateUserBody, {
        fields: Object.keys(updateUserBody),
        where: { id: req.params.id },
        transaction: _transaction
      })
      await _transaction.commit()

      let userResponseData = await this.readOne(userId)
      let userResponse = await this.model.findOne({
        where: { id: userId },
        include: [
          {
            model: this.models.UserRole
          }
        ]
      })
      let sycnResponse :any =
      {
           userId:userId,
           ...userResponseData
      }
      delete userResponse?.dataValues?.password

      return Promise.resolve(userResponse)
    } catch (err:any) {
      await _transaction.rollback()
      this.logger.error("Error in Updating User ",err.message)
      return Promise.reject(err.message)
    }
  }

  // Delete User 
  async deleteUser(req: Request) {
    let _transaction = await databaseInstance.transaction()
    try {
      let userId = req.params.id
      
      var userExist = await this.model.findOne({
    where: { id: userId },
    include: [
      {
        model: this.models.UserRole
      }
    ],
    transaction: _transaction
  })
      if (userExist == null)
        throw new Exception(constant.ERROR_TYPE.NOT_FOUND, `User not found for id ${userId}`,)
      await this.model.destroy({ where: { id: userId }, logging: true }, { transaction: _transaction })
      await this.models.UserRole.destroy({ where: { userId: userId }, logging: true }, { transaction: _transaction })

      await _transaction.commit()
      return Promise.resolve(`User ${userExist?.username} deleted successfully`)
    } catch (err:any) {
      await _transaction.rollback()
      this.logger.error("Error in deleting User",err.message)
      return Promise.reject(err.message)
    }
  }


  // Response Handler
  async CreateUserResponse(data: any) {
    
    try {
      let response = {
        id: data.userData.id,
        username: data.userData.username,
        name: data.userData.name,
        email: data.userData.email,
        imageUrl: data.userData.imageUrl,
        gender: data.userData.gender,
        status: data.userData.status,
        contact: data.userData.contact || null,
        tenantId: data.tenantRole.tenantId,
        roleId: data.tenantRole.roleId,
        roleName: data.tenantRole.roleName,
        siteId: data.tenantRole.siteId,
        zoneId: data.tenantRole.zoneId || null,
        homeSite:data.tenantRole.homeSite,
        createdAt: data.userData.createdAt,
        updatedAt: data.userData.updatedAt,
        deletedAt: data.userData.deletedAt,
        createdBy: data.userData.createdBy || null,
        updatedBy: data.userData.updatedBy || null,


      }
      return Promise.resolve(response)
    } catch (err:any) {
      this.logger.error("Error in creating User Response",err.message)
      return Promise.reject(err.message)
    }
  }
  async ReadUserResponse(data: any) {
    try {
      let response = {
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email,
        imageUrl: data.imageUrl,
        gender: data.gender,
        status: data.status,
        contact: data.contact,
        password: data.password,
        tenantId: data.userRole.tenantId,
        roleId: data.userRole.roleId,
        roleName: data.userRole.roleName,
        siteId: data.userRole.siteId,
        zoneId: data.userRole.zoneId,
        homeSite:data.userRole.homeSite,
      }
      return Promise.resolve(response)
    } catch (err:any) {
      this.logger.error("Error in creating read User Response",err.message)
      return Promise.reject(err.message)
    }
  }

  // upload the Profile image to the Azure Storage.
  async uploadImagetoS3(req: Request, res: Response) {
   
    try {
   
      return Promise.resolve("User Profile Pics Uploaded Successfully");

    } catch (err: any) {
      this.logger.error("Error in uploading user profile pics",err.message)
      return Promise.reject(err.message)
    }
  }


  

}

