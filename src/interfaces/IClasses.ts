import { ICourse } from "./ICourse";

export interface IClasses {
  id?: number;
  title: string;
  description: string;
  url: string;
  course: ICourse;
  
}

export interface IRequestClasses {
  title: string;
  description: string;
  url: string;
  courseId: number; // Para receber o ID do curso associado
}

export interface IClassesRepository {
  create(data: IClasses): Promise<IClasses>;
  findById(id: number): Promise<IClasses | null>;
  findByIds(number: []): Promise<IClasses[] | null>;
  findAll(): Promise<IClasses[]>;
  update(id: number, data: IClasses): Promise<IClasses>;
  delete(id: number): Promise<void>;
}
