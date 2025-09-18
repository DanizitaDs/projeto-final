import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";

type JwtPayload = {
  id:number
}


export const authMiddleware = async (req:Request , res:Response , next:NextFunction ) => {
    const { authorization } = req.headers

    const userRepository = new UserRepository()

    if(!authorization){
      return res.status(401).json("Unauthorized")
    }   

    const token = authorization.split(" ")[1]
    
    const { id } = jwt.verify(token, process.env.JWT_PASS ?? "defaultSecret") as JwtPayload
    
    const user = await userRepository.findById(id)

    if(!user){
      throw new AppError("Unauthorized")
    }

    req.user = user;

    next()
}