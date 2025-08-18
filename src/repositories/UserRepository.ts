import { Repository } from "typeorm";
import { AppDataSource } from "../database/connection";
import { AppError } from "../utils/AppError";
import { IUser, IUserRepository, IUserUpdate } from "../interfaces/IUser";
import { User } from "../models/User";

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(data: IUser): Promise<IUser> {
    // const course = new User(data.name ,data.email, data.password);
    const course = this.repository.create(data);
    await this.repository.save(course);
    return course;
  }

  async findById(id: number): Promise<IUser | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByEmailWithPassword(email:string): Promise<IUser | null>{
    return await this.repository.findOne({
      where:{email},
      select:["id", "name", "email", "password", "role", "profileUrl"]
    })
  }

  async findAll(): Promise<IUser[]> {
    return await this.repository.find();
  }

  async update(data: IUserUpdate): Promise<IUser> {
  const user = await this.repository.findOneBy({id:data.id});
  if (!user) throw new AppError("User not found", 404);

  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.password !== undefined) {
    user.password = data.password;
    user["shouldHash"] = true;
  }
  
  if (data.profileUrl !== undefined) user.profileUrl = data.profileUrl;

  await this.repository.save(user);

  return user;
}


  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new AppError("User not found", 404);
    }
  }
}
