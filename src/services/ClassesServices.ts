import { IClasses, IRequestClasses } from "../interfaces/IClasses";
import { ClassesRepository } from "../repositories/ClassesRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { AppError } from "../utils/AppError";

export class ClassesService {
  private classesRepository: ClassesRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.classesRepository = new ClassesRepository();
    this.courseRepository = new CourseRepository(); // Inicializa o repositório de cursos
  }

  async createClass(data: IRequestClasses): Promise<IClasses> {
    this.validateClassesData(data);
    console.log("data", data);

    const course = await this.courseRepository.findById(data.courseId);
    console.log("course", course);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const classData: IClasses = {
      title: data.title,
      description: data.description,
      url: data.url,
      course, // Associate course using ID received
    };

    return await this.classesRepository.create(classData);
  }

  async getClassById(id: number): Promise<IClasses> {
    const classEntity = await this.classesRepository.findById(id);
    if (!classEntity) {
      throw new AppError("Class not found", 404);
    }
    return classEntity;
  }

  async getAllClasses(): Promise<IClasses[]> {
    return await this.classesRepository.findAll();
  }

  async updateClass(id: number, data: IRequestClasses): Promise<IClasses> {
    this.validateClassesData(data);

    const course = await this.courseRepository.findById(data.courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const classData: IClasses = {
      title: data.title,
      description: data.description,
      url: data.url,
      course, // Associate course using ID received
    };
    return await this.classesRepository.update(id, classData);
  }

  async deleteClass(id: number): Promise<void> {
    await this.classesRepository.delete(id);
  }

  /**
   * Valida os dados do usuário, garantindo que estejam corretos.
   */
  private validateClassesData(data: IRequestClasses): void {
    if (!data.title || data.title.trim() === "") {
      throw new AppError("Title is required", 400);
    }

    if (!data.description || data.description.trim() === "") {
      throw new AppError("Description is required", 400);
    }

    if (!data.url || data.url.trim() === "") {
      throw new AppError("url URL is required", 400);
    }

    if (!data.courseId) {
      throw new AppError("Course Id is required", 400);
    }
  }
}
