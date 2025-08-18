import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  OneToMany,
  ManyToMany,
} from "typeorm";
import bcrypt from "bcryptjs";
import { Reaction } from "./Reaction";
import { Course } from "./Course";
import { ICourse } from "../interfaces/ICourse";
import { IReaction } from "../interfaces/IReaction";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: "text", nullable: true })
  profileUrl?: string;
  
  @Column({ type: "varchar", length: 255, nullable: false, select: false })
  password: string;
  private shouldHash: boolean;

  @Column({ type: "varchar", length:7, nullable: false, default: "student" })
  role: "student" | "teacher" | "admin";
  
  //@OneToMany( () => Course, (course) => course.userCreator)
  //createdCourses:ICourse[]

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: IReaction[]
  
  constructor(name:string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.shouldHash = true;
  }
  
  @AfterLoad()
  private loadOriginal() {
    this.shouldHash = false;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.shouldHash) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.shouldHash = false;
    }
  }

  

  toJSON() {
    // remove shouldHash and password from the JSON representation
    const { password, shouldHash, ...rest } = this;
    return rest;
  }
}
