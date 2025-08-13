import { In, Repository } from "typeorm";
import { Reaction } from "../models/Reaction";
import { AppDataSource } from "../database/connection";
import { IReaction, IRequestReaction } from "../interfaces/IReaction";
import { AppError } from "../utils/AppError";


export class ReactionRepository{
    private repository: Repository<Reaction>

    constructor(){
        this.repository = AppDataSource.getRepository(Reaction);
    }

    async create(data:IReaction):Promise<Reaction>{
        const reaction = this.repository.create(data);
        await this.repository.save(reaction);
        return reaction
    }

    async findById(id:number): Promise<Reaction | null>{
        return await this.repository.findOne({
            where: { id },
            relations: {
                classes:true,
                user:true,
                course:true
            }
        })
    }

    async findByIds(ids: number[]):Promise<Reaction[]>{//Não utilizado
        return await this.repository.find({
            where:{
                id: In([ids])
            },
            relations: {
                classes:true,
                user:true,
                course:true
            }
        })
    }

    async findByUserId(userId:number):Promise<Reaction[] | null>{
        return await this.repository.find({
            where:{
                user: {id:userId}//Desse modo é possivel encontrar sem precisar de uma instancia de um usuario
            },
            relations:{
                classes: true,
                user: true,
                course: true
            }
        })
    }

     async findExact(data:IRequestReaction):Promise<Reaction | null>{
        try {
        const where: any = {
            user: { id: data.userId }
        };

        if (data.classeId !== undefined) {
            where.classes = { id: data.classeId };
        }

        if (data.courseId !== undefined) {
            where.course = { id: data.courseId };
        }

        return await this.repository.findOne({
            where,
            relations: {
                classes: true,
                user: true,
                course: true
            }
        });
    } catch {
        throw new AppError("Error in rR.findExact");
    }
        
    }

    /**
   * 
   * @returns Retorna todas as Reactions.
   */
    async findAll():Promise<IReaction[]>{
        return await this.repository.find({
            
        })
    }

    async updateExact(id: number, data: IReaction):Promise<IReaction>{
        const result = await this.repository.update(id, data);
        if (result.affected === 0) {
            throw new AppError("Course not found", 404);
          }
        
        const updatedReaction = await this.findById(id);

        if (!updatedReaction) {
            throw new AppError("Error retrieving updated reaction", 500);
        }

        return updatedReaction;
    }

    async delete(id:number): Promise<void> {
        const result = await this.repository.delete(id);
        if(result.affected === 0) 
        throw new AppError("Reaction not found", 404);
    }
}