import { Course } from "../models/Course";
import { IClasses } from "./IClasses";
import { Reaction } from "../models/Reaction";
import { ICourse } from "./ICourse";
import { IReaction } from "./IReaction";

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: tUserRole
  profileUrl?: string;
  //createdCourses?: ICourse[];
  reactions?: IReaction[];
}

export interface IRequestUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  /**
   * URL para a imagem do perfil do usuário. Pode ser:
   * - Uma string de URL direta fornecida pelo cliente
   * - Um caminho de URL gerado após o upload do arquivo (/uploads/nome_do_arquivo)
   * - Indefinido se nenhuma imagem de perfil estiver configurada
   */
  profileUrl?: string;
}
export interface IUserRequestWithFile {
  userData: IRequestUser;
  profileImage?: Express.Multer.File;
}

export interface IUserUpdate {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  profileUrl?: string;
}

export interface IRequestUserUpdate {
  name?: string;
  email?: string;
  password?: string;
  profileUrl?: string;
}

export interface IUserWithToken{
  user:IUser,
  token: string
}

export type tUserRole = "student" | "teacher" | "admin"

export interface IUserRepository {
  create(data: IUser): Promise<IUser>;
  findById(id: number): Promise<IUser | null>;
  update(data: IUserUpdate): Promise<IUser>;
  delete(id: number): Promise<void>;
  updateRole(user:IUser, newRole:tUserRole): Promise<void>
  adminPreset():Promise<void>
  //getReactions()            |
  //getReactionById()         |
  //getAllCreatedCourses()    |
  //getCreatedCourseById()    | Implementar
}
