import { Request, Response } from "express";
import { ReactionService } from "../services/ReactionService";
import { ReactionRepository } from "../repositories/ReactionRepository";
import { IReaction, IRequestReaction } from "../interfaces/IReaction";


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
  
  async findAll(request: Request, response: Response): Promise<Response> {
    const reaction = await this.reactionService.getAllReactions();
    return response.json(reaction);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const reactionData: IRequestReaction = request.body;
    const reaction = await this.reactionService.updateReaction(
      Number(id),
      reactionData
    );
    return response.json(reaction);
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    await this.reactionService.deleteReaction(Number(id));
    return response.status(204).send();
  }
}
