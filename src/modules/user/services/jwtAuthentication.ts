import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../../middlewares/resp-handler/constants'

export const generateJwt =async(data:any)=>
{
    console.log("recceived Data =>",data, JWT_SECRET)    
    var token = jwt.sign(data, JWT_SECRET);
    return token;
}
