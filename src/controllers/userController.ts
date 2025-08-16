import { Request, Response } from "express";
import { AppDataSource } from "../database/connection";
import { User } from "../models/User";
import bcryptjs from "bcryptjs";
import { UserService } from "../services/UserService";
import { IRequestUser } from "../interfaces/IUser";
import { AppError } from "../utils/AppError";

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

  async login(req: Request, res: Response):Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Usuário e senha devem ser informados", 400);
      }

      const user = await userRepository.findOne({
        where: { email },
        select: ["id", "password", "profileUrl"]
        });

      if (!user) {
        throw new AppError("Usuario não encontrado", 404);
      }

      // const isValid = await bcryptjs.compare(password, user.password);
      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) {
        throw new AppError("Senha inválida", 401);
      }

      return res.status(200).json({
        message: "Login bem-sucedido",
        id: user.id, // ESSENCIAL para salvar no localStorage
        profileUrl: user.profileUrl,
      });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
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
      const { id } = req.params;
      const userData: IRequestUser = req.body;
      // Get the file from multer middleware
      const profileImage = req.file;

      const user = await userService.updateUser(
        Number(id),
        userData,
        profileImage
      );
      console.log("OKKKKKKKKKK", user);
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  }

  // Deletar usuário
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
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
      const { id } = req.params;
      const profileImage = req.file;

      if (!profileImage) {
        throw new AppError("Nenhuma imagem foi enviada", 400);
      }

      const user = await userService.uploadProfilePicture(
        Number(id),
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
