import { Request, Response } from 'express';
import { RoleController } from '../controllers/role';
import { UserController } from '../controllers/user';
import { AuthenticationController } from '../controllers/authentication';
import { PremissionController } from '../controllers/permission'
import { userValidator } from '../validators/user';
import { config } from '../../../config';
import { RolePermissionController } from '../controllers/rolePermission';
import { Validation } from '../../../core/auth';

export const userRoutes = ({ app, logger, models }: any) => {
  try{
  const userController = new UserController({ logger, models });
  const roleController = new RoleController({ logger, models });
  const authenticationController = new AuthenticationController({ logger, models });
  const permissionController = new PremissionController({ logger, models })
  const rolePermissionController = new RolePermissionController()
  const validate = new Validation()

  // -------------------------User Routes ----------------------------------- \

  //read All the user from the data base
  app.get(`${config.API_PREFIX}/users`, validate.checkValidation,(req: Request, res: Response) => {
  userController.readAll(req, res);
});

// API for Create User 
app.post(`${config.API_PREFIX}/user`,  validate.checkValidation,userValidator.makeValidation('create'), (req: Request, res: Response) => {
  userController.create(req, res);
});

// API for Update User 
app.patch(`${config.API_PREFIX}/user/:id`, validate.checkValidation, userValidator.makeValidation('update'), (req: Request, res: Response) => {
  userController.update(req, res);
});

// Read User by Id
app.get(`${config.API_PREFIX}/user/:id`, validate.checkValidation, (req: Request, res: Response) => {
  userController.readOne(req, res);
});
// Delete User by Id
app.delete(`${config.API_PREFIX}/user/:id`, validate.checkValidation, (req: Request, res: Response) => {
  userController.delete(req, res);
});


//--------------------------- Role Routes----------------------------------

// Read role by Id
app.get(`${config.API_PREFIX}/role/:id`, validate.checkValidation, (req: Request, res: Response) => {
  roleController.readOne(req, res);
});
// Read roles 
app.get(`${config.API_PREFIX}/roles`, validate.checkValidation, (req: Request, res: Response) => {
  roleController.readAll(req, res);
});

//---------------------------Authentication Routes----------------------------------

app.post(`${config.API_PREFIX}/login`, userValidator.makeValidation('changepassword'), (req: Request, res: Response) => {
  authenticationController.login(req, res);
});

app.post(`${config.API_PREFIX}/logout`, userValidator.makeValidation('logout'), (req: Request, res: Response) => {
  authenticationController.logout(req, res);
});


app.post(`${config.API_PREFIX}/changepassword`, validate.checkValidation,userValidator.makeValidation('changepassword'), (req: Request, res: Response) => {
  authenticationController.changePassword(req, res);
});

app.post(`${config.API_PREFIX}/forgotpasswordsendemail`, userValidator.makeValidation('forgotpassword'), (req: Request, res: Response) => {
  authenticationController.forgotPasswordSendEmail(req, res);
});

app.post(`${config.API_PREFIX}/forgotpassword`, (req: Request, res: Response) => {
  authenticationController.forgotPassword(req, res);
});

app.post(`${config.API_PREFIX}/resendinvite`, validate.checkValidation,(req: Request, res: Response) => {
  authenticationController.resendInvite(req, res);
});




//------------------------------ Permission Routes -----------------------------

// Read role by Id
app.get(`${config.API_PREFIX}/permission/:id`, (req: Request, res: Response) => {
  permissionController.readOne(req, res);
});
// Read roles 
app.get(`${config.API_PREFIX}/permissions`, (req: Request, res: Response) => {
  permissionController.readAll(req, res);
});



//-------------------------------------Role Permission-------------------------------


app.get(`${config.API_PREFIX}/roleslist`,  validate.checkValidation,(req: Request, res: Response) => {
  rolePermissionController.getRolesList(req, res);
});
app.get(`${config.API_PREFIX}/rolesdetails/:id`, validate.checkValidation, (req: Request, res: Response) => {
  rolePermissionController.getRoleDetails(req, res);
})



  }catch(error:any){
    logger.error("error occure in user routes.",error)
  }

}