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

export interface IUserRepository {
  create(data: IUser): Promise<IUser>;
  findById(id: number): Promise<IUser | null>;
  update(id: number, data: IUser): Promise<IUser>;
  delete(id: number): Promise<void>;
  //getReactions()            |
  //getReactionById()         |
  //getAllCreatedCourses()    |
  //getCreatedCourseById()    | Implementar
}
