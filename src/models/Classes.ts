import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  OneToMany
 } from "typeorm";
import { IClasses } from "../interfaces/IClasses";
import { Course } from "./Course";
import { ICourse } from "../interfaces/ICourse";
import { Reaction } from "./Reaction";

@Entity("classes")
export class Classes implements IClasses {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column()
  url: string;

  @ManyToOne(() => Course, (course) => course.classes)
  course: ICourse; // Relacionamento com cursos

  @OneToMany(() => Reaction, (reaction:Reaction) => reaction.classes )
  reactions:Reaction[];

  // @Column({type:"date", nullable:false})
  // public data:Date;

  // @OneToMany(() => Comentario, comentario => comentario.postagem)
  // @JoinColumn({ name: "postId" })
  // public comentarios!: Comentario[]

  constructor(title: string, description: string, url: string) {
    this.title = title;
    this.description = description;
    this.url = url;
  }
}
