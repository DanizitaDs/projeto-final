import { IUser, IRequestUser, IUserWithToken, IUserUpdate, IRequestUserUpdate, tUserRole } from "../interfaces/IUser";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"



// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "..", "..", "uploads");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename using timestamp and original name
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

// File filter function to validate file types
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.")
    );
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  },
});

// ------------------------------------------------------------------------------
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(
    data: IRequestUser,
    profileImage?: Express.Multer.File
  ): Promise<IUser> {
    this.validateUserData(data);

    const userData: IUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      profileUrl: profileImage
        ? `/uploads/${profileImage.filename}`
        : data.profileUrl,
      role:"student",
    };
    return await this.userRepository.create(userData);
  }

  async login(email:string, password: string): Promise<IUserWithToken | null> {
    
    if (!email || !password) {
      throw new AppError("Usuário e senha devem ser informados", 400);
    }
    
    const user = await this.userRepository.findByEmailWithPassword(email)
    
    if (user === null) {
      throw new AppError("User not found", 404);
    }
    
    // const isValid = await bcryptjs.compare(password, user.password);
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      throw new AppError("Senha inválida", 401);
    }

    const token = jwt.sign({id: user.id}, process.env.JWT_PASS ?? "defaultSecret", {expiresIn: "8h"})
    return {user, token}
  }

  async uploadProfilePicture(
    userId: number,
    file: Express.Multer.File
  ): Promise<IUser> {
    const user = await this.userRepository.findById(userId);


    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userUpdate:IUserUpdate = {
      id:userId,
      name: user.name,
      email: user.email,
      profileUrl: user.profileUrl,
      password: undefined
    }

    // Delete old profile picture if exists
    if (userUpdate.profileUrl && userUpdate.profileUrl.startsWith("/uploads/")) {
      const oldProfilePath = path.join(__dirname, "..", "..", userUpdate.profileUrl);
      if (fs.existsSync(oldProfilePath)) {
        fs.unlinkSync(oldProfilePath);
      }
    }

    // Update user with new profile picture URL
    const updatedUser = await this.userRepository.update({
      ...userUpdate,
      profileUrl: `/uploads/${file.filename}`,
    });

    return updatedUser;
  }

  async getUserById(id: number): Promise<IUser> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }

  async updateUser(
    id: number,
    data: IRequestUserUpdate,
    profileImage?: Express.Multer.File
  ): Promise<IUser> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Handle profile image if provided
    let profileUrl = data.profileUrl;
    if (profileImage) {

      // Delete old profile image if exists
      if (user.profileUrl && user.profileUrl.startsWith("/uploads/")) {
        const oldProfilePath = path.join(
          __dirname,
          "..",
          "..",
          user.profileUrl
        );
        if (fs.existsSync(oldProfilePath)) {
          fs.unlinkSync(oldProfilePath);
        }
      }
      profileUrl = `/uploads/${profileImage.filename}`;
    }

    const userData: IUserUpdate = {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      profileUrl: profileUrl
    };

    return await this.userRepository.update(userData);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Delete user's profile picture if exists
    if (user.profileUrl && user.profileUrl.startsWith("/uploads/")) {
      const profilePath = path.join(__dirname, "..", "..", user.profileUrl);
      if (fs.existsSync(profilePath)) {
        fs.unlinkSync(profilePath);
      }
    }

    await this.userRepository.delete(id);
  }

  async updateRole(
    userAdmin:IUser,
    userIdToBeUpdated:number,
    newRole: tUserRole
  ):Promise<void>{
    if(userAdmin.role != "admin"){
      throw new AppError("User not is admin", 403)
    }

    const user = await this.userRepository.findById(userIdToBeUpdated)

    if(!user){
      throw new AppError("User not found", 404)
    }

    this.userRepository.updateRole(user, newRole)
  }

  /**
   * Valida os dados do usuário, garantindo que estejam corretos.
   */
  private validateUserData(data: IRequestUser): void {
    if (!data.name || data.name.trim() === "") {
      throw new AppError("Name is required", 400);
    }

    if (!data.email || data.email.trim() === "") {
      throw new AppError("Email is required", 400);
    }

    if (!data.password || data.password.trim() === "") {
      throw new AppError("Password is required", 400);
    }
  }

  private validateUpdateUserData(data: IRequestUser): void {
    if (!data.name || data.name.trim() === "") {
      throw new AppError("Name is required", 400);
    }

    if (!data.email || data.email.trim() === "") {
      throw new AppError("Email is required", 400);
    }

    if (!data.password || data.password.trim() === "") {
      throw new AppError("Password is required", 400);
    }
  }
}
