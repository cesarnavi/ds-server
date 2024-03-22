import { Request, Response } from "express"
import { User } from "../models";
import { generateJWT } from "../middlewares";

const onError = (res: Response, msg: string) => { //util for handling error
  return res.status(400).send({ message: msg })
}

const normalizeStr = (str:string)=>str.toLowerCase().trim();

export async function login(req: Request, res: Response){
    let { username, email } = req.body;
    
    if (!(username && email)){
        return onError(res,"Required email and username");
    }
 
    const user = await User.findOne({ 
        username: normalizeStr(username),
        email: normalizeStr(email)
    });
    if(!user){
        return onError(res,"User not found");
    }

    // Generate and sign a JWT that is valid for one hour.
    const token = generateJWT({ 
        _id: user._id, 
        username: user.username, 
        role: user.role 
    }, 60*60);

    // Return the JWT in our response.
    return res.type('json').send({ 
        token,
        username: user.username, 
        role: user.role 
    });
}


