import { Request, Response, NextFunction } from "express";
import { onError } from "../utils";
export function authorization(...roles){


    return (req: Request, res: Response, next: NextFunction)=>{
        const user = req["user"];
        if(!user){
            console.log(" [authorization] Access Denied: Invalid user ")
            return onError(res, "Acceso denegado")
        }
        try {
            if(!roles.includes(user.role)){
                throw new Error("Access Denied");
            }
            next();
        } catch (error) {
            console.log(" [authorization] Access denied: ", error.message);
            return onError(res, "Acceso denegado")
        }
    }

}
