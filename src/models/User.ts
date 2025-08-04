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

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;
  
  // @OneToMany( () => Course, (course) => course.userCreator)
  // createdCourses:ICourse[]

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: IReaction[]

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
