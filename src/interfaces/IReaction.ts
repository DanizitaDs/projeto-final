import { ICourse } from "./ICourse";
import { IClasses } from "./IClasses";
import { IUser } from "./IUser";

export interface IReaction {
  id?: number;
  user: IUser;
  course?: ICourse;
  classe?: IClasses;
  reaction: "like" | "dislike"
}

export interface IRequestReaction {
  id?: number;
  userId: number;
  courseId?: number; 
  classeId?: number;
  reaction: "like" | "dislike"
}

export interface IReactionValidation{
  user:IUser,
  course?:ICourse,
  classe?:IClasses,
  
}

export interface IReactionRepository {
  create(data: IClasses): Promise<IClasses>;
  findById(id: number): Promise<IClasses | null>;
  findByUser(userId:number): Promise<IUser[] | null>;//Fazendo
  findAll(): Promise<IClasses[]>;
  update(id: number, data: IClasses): Promise<IClasses>;
  delete(id: number): Promise<void>;
  
}
