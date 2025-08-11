import { IClasses } from "../interfaces/IClasses";
import { ICourse } from "../interfaces/ICourse";
import { IReaction, IReactionRepository, IReactionValidation, IRequestReaction } from "../interfaces/IReaction";
import { Classes } from "../models/Classes";
import { Course } from "../models/Course";
import { Reaction } from "../models/Reaction";
import { ClassesRepository } from "../repositories/ClassesRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { ReactionRepository } from "../repositories/ReactionRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";


export class ReactionService {
  private courseRepository: CourseRepository;
  private classRepository: ClassesRepository;
  private userRepository: UserRepository;
  private reactionRepository: ReactionRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.classRepository = new ClassesRepository();
    this.userRepository = new UserRepository()
    this.reactionRepository = new ReactionRepository()

  }

  async createReaction(data: IRequestReaction): Promise<IReaction> {
    const errorLocation = "Error in ReactionService.createReaction()."
    const {user, course, classe} = await this.validateReactionData(data, errorLocation);

    const reactionData:IReaction = {
      id: data.id,
      user: user,
      course: course,
      classe: classe,
      reaction: data.reaction
    };

    const reactionsFound: Reaction[] | null = await this.reactionRepository.findByUserId(data.userId);

    let validatedReaction:boolean = true;

    //Verificar se existe outra reaction com mesmo UserId e mesma relação que a relação sendo criada
    try{
      reactionsFound?.forEach((reaction)=>{
        if(reaction.course?.id == course?.id){
          validatedReaction = false;
        } else if(reaction.classes?.id == classe?.id){
          validatedReaction = false
        }
      })

    } catch(error){
      throw new AppError(`${errorLocation} ${error}`);
    }
    
    if(validatedReaction){
      return await this.reactionRepository.create(reactionData);

    } else{
      throw new AppError(`${errorLocation} Outra reaction com mesmo relacionamento já existe`);
    }

  }

  async getReactionById(id: number): Promise<IReaction> {
    const reaction = await this.reactionRepository.findById(id);

    if (!reaction) {
      throw new AppError("Reaction not found", 404);
    }
    return reaction;
  }

  async getAllReactions(): Promise<IReaction[]> {
    return await this.reactionRepository.findAll();
  }

  async getReactionByUserId(userId:number): Promise<IReaction[] | null>{
    return await this.reactionRepository.findByUserId(userId);
  }

  async updateReaction(id: number, data: IRequestReaction): Promise<IReaction> {
    const errorLocation = "Error in ReactionService.updateReaction()."
    const {user, course, classe} = await this.validateReactionData(data, errorLocation);

    const reactionData:IReaction = {
      id: data.id,
      user: user,
      course: course,
      classe: classe,
      reaction: data.reaction
    };

    return await this.reactionRepository.update(id, reactionData);
  }

  async deleteReaction(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  /**
  * Valida os dados da Reaction, garantindo que estejam corretos.
  * Garante que contenha extamente um relacionamento, courseId ou classId.
  * Verifica se os ids correspondem a um registro no banco de dados.
  */
   private async validateReactionData(data: IRequestReaction, errorLocation:string):Promise<IReactionValidation>  {
    if (!data.userId) {
      throw new AppError("userId is required", 400);
    }

    if (!data.reaction) {
      throw new AppError("reactionId is required", 400);
    }

    if (!(data.courseId || data.classeId)) {
      throw new AppError("Either courseId or classId is required", 400);
    }
    
    //Variaveis que serão retornadas
    let user, course, classe;

    user = await this.userRepository.findById(data.userId);
    
    //Verificando se usuario com id informado existe
    if(!user){
      throw new AppError(`${errorLocation} User not found. userId: ${data.userId}`, 404)
    }

    //Verificando se existe uma classeId ou um courseId na reaction e se tal existe no banco de dados
    if (data.classeId) {
        classe = await this.classRepository.findById(data.classeId);
        if(!classe){
            throw new AppError(`${errorLocation} classe not found. classeId: ${data.classeId}`)
        }
    } else if(data.courseId){
        course = await this.courseRepository.findById(data.courseId)
        if(!course){
            throw new AppError(`${errorLocation} course not found. courseId: ${data.courseId}`)
        }
    } else{
        throw new AppError(`${errorLocation} Either courseId or classId is required`, 400);
    }

    //Retornando as entidades
    return {user, course, classe}
  }
}
