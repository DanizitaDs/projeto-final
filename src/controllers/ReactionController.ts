import { Request, Response } from "express";
import { ReactionService } from "../services/ReactionService";
import { ReactionRepository } from "../repositories/ReactionRepository";
import { IReaction, IRequestReaction } from "../interfaces/IReaction";
import { AppError } from "../utils/AppError";


export class ReactionController {
  private reactionService: ReactionService;

  constructor() {
    this.reactionService = new ReactionService();
  }

  async create(request: Request, response: Response): Promise<Response> {
    const reactionData: IRequestReaction = request.body;
    const reaction = await this.reactionService.createReaction(reactionData);
    return response.status(201).json(reaction);
  }

  async findById(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const reaction = await this.reactionService.getReactionById(Number(id));
    return response.json(reaction);
  }

  async findByUser(request: Request, response: Response): Promise<Response> {
    const { userId } = request.params;
    const reaction = await this.reactionService.getReactionByUserId(Number(userId));
    return response.json(reaction);
  }

  async findExact(request: Request, response: Response): Promise<Response> {
    let { userId, courseId, classesId, reaction} = request.body;

    const data: IRequestReaction = { 
        userId: userId? userId : undefined, 
        courseId: courseId? courseId : undefined, 
        classesId: classesId? classesId : undefined,
        reaction
    };

    const reactionFinded = await this.reactionService.getExactReaction(data);
    return response.json(reactionFinded);
}

  
  async findAll(request: Request, response: Response): Promise<Response> {
    const reaction = await this.reactionService.getAllReactions();
    return response.json(reaction);
  }

  async toggleReaction(request: Request, response: Response): Promise<Response> {
    const reactionData: IRequestReaction = request.body;
    const reaction = await this.reactionService.toggleReaction(reactionData);
    return response.json(reaction);
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    await this.reactionService.deleteReaction(Number(id));
    return response.status(204).send();
  }
}
