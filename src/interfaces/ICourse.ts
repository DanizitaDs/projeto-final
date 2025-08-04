import { User } from "../models/User";
import { IClasses } from "./IClasses";
import { IReaction } from "./IReaction";
import { IUser } from "./IUser";

export interface ICourse {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  externalLink?: string;
  classes?: IClasses[];
  reactions?: IReaction[];
  // userCreator: IUser
}

export interface IRequestCourse {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  externalLink?: string;
  classesId?: number[];
  userId: number;
}

export interface ICourseRepository {
  create(data: ICourse): Promise<ICourse>;
  findById(id: number): Promise<ICourse | null>;
  findAll(): Promise<ICourse[]>;
  update(id: number, data: ICourse): Promise<ICourse>;
  delete(id: number): Promise<void>;
  //getUserCreator()    | Implementar
}
