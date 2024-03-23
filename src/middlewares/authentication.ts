import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { User } from "../models";
import { onError } from "../utils";
dotenv.config();

const secret = process.env.JWT_SECRET;
if(!secret){
    throw new Error(" [authentication] Secret token for jwt is required");
}

export async function authentication(req: Request, res: Response, next: NextFunction){
    const token = req.header("Authorization") || req.query._ as string;
    if(!token){
        console.log(" [authentication] Access Denied: No token provided ")
        return onError(res, "invalid token")
    }
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), secret);
        const usr = await User.findById(decoded["_id"]);
        if(!usr){
            throw new Error("User not found");
        }
        req["user"] = usr;
        next();
    } catch (error) {
        return onError(res, "invalid token")
    }
}

export function generateJWT(userPayload: Object | string, ttl?: number){

    return jwt.sign(userPayload,secret,{ expiresIn: ttl });
}