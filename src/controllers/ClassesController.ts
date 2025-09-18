import { Request, Response } from "express";
import { IClasses, IRequestClasses } from "../interfaces/IClasses";
import { ClassesService } from "../services/ClassesServices";

export class ClassesController {
  private classesService: ClassesService;

  constructor() {
    this.classesService = new ClassesService();
  }

  async create(request: Request, response: Response): Promise<Response> {
    const classData: IRequestClasses = request.body;
    const classEntity = await this.classesService.createClass(classData);
    return response.status(201).json({
      id: classEntity.id,
      title: classEntity.title,                             
      description: classEntity.description,
      url: classEntity.url,
      //   course: {
      //     id: classEntity.courses.id, // Inclui apenas o ID do curso
      //     title: classEntity.courses.title, // Inclui o título do curso se necessário
      //     // Você pode incluir outras propriedades que desejar do curso sem incluir as aulas
      //   },
    });
  }

  async findById(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const classEntity = await this.classesService.getClassById(Number(id));
    return response.json(classEntity);
  }

  async findAll(request: Request, response: Response): Promise<Response> {
    const classes = await this.classesService.getAllClasses();
    return response.json(classes);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const classData: IRequestClasses = request.body;
    const classEntity = await this.classesService.updateClass(
      Number(id),
      classData
    );
    return response.status(201).json({
      id: classEntity.id,
      title: classEntity.title,
      description: classEntity.description,
      url: classEntity.url,
      //   course: {
      //     id: classEntity.courses.id, // Inclui apenas o ID do curso
      //     title: classEntity.courses.title, // Inclui o título do curso se necessário
      //     // Você pode incluir outras propriedades que desejar do curso sem incluir as aulas
      //   },
    });
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    await this.classesService.deleteClass(Number(id));
    return response.status(204).send();
  }
}
