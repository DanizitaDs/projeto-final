import { Request, Response } from "express";
import { AppDataSource } from "../database/connection";
import { User } from "../models/User";
import { UserService } from "../services/UserService";
import { IRequestUser, IRequestUserUpdate } from "../interfaces/IUser";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";



const userRepository = AppDataSource.getRepository(User);
const userService = new UserService();

export class UserController {
  constructor() {}

  /**
   * @param req
   * @param res
   * @returns -> Retorna o usuario criado
  */
 
 async create(req: Request, res: Response): Promise<Response> {
   try {
     const userData: IRequestUser = req.body;
     // Get the file from multer middleware
     const profileImage = req.file;
     
     const user = await userService.createUser(userData, profileImage);
     return res.status(201).json(user);
    } catch (error: any) {
      return res
      .status(error.statusCode || 500)
      .json({ message: error.message });
    }
  }
  
  async login(req: Request, res: Response):Promise<Response> {
    try {
      const { email, password } = req.body;
      const userWithtoken = await userService.login(email, password)
 
      return res.status(200).json({
        user:userWithtoken?.user,
        message: "Login bem-sucedido",
        token: userWithtoken?.token
        // id: user.id, // ESSENCIAL para salvar no localStorage
        // profileUrl: user.profileUrl,
      });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }

  async getProfile(req:Request, res:Response):Promise<Response> {
    return res.json(req.user)
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error: any) {
      return res
        .status(error.statusCodse || 500)
        .json({ message: error.message });
    }
  }


  // Buscar usuário por ID
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(Number(id));
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }

  // Atualizar usuário
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const userRequest:IRequestUserUpdate = req.body
      
      const user = req.user
      // Get the file from multer middleware
      const profileImage = req.file;

      if(!user.id){
        throw new AppError("id not returned", 500)
      }

      const newUser = await userService.updateUser(
        user.id,
        userRequest,
        profileImage
      );

      return res.json(newUser);

    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }

  // Deletar usuário
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.user;
      await userService.deleteUser(Number(id));
      return res.status(204).send();
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }

  // Adicionar método para upload de foto de perfil
  async uploadProfilePicture(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user
      const profileImage = req.file;

      if (!profileImage) {
        throw new AppError("Nenhuma imagem foi enviada", 400);
      }

      if(!user.id){
        throw new AppError("Id not ruturned", 500)
      }

      const newUser = await userService.uploadProfilePicture(
        user.id,
        profileImage
      );
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }
}
