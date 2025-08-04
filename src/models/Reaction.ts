import { Classes } from './Classes';
import { Course } from './Course';

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable
 } from 'typeorm';
import { User } from './User';
import { IClasses } from '../interfaces/IClasses';
import { ICourse } from '../interfaces/ICourse';
  
@Entity("reactions")
export class Reaction{
    @PrimaryGeneratedColumn()
    id!:number

    @ManyToOne(() => User, (user:User) => user.reactions)
    user:User

    @Column({type:'varchar', length: 7})
    reaction: "like" | "dislike";

    @ManyToOne(() => Course, (course) => course.reactions, { nullable:true })
    course?:ICourse;

    @ManyToOne(() => Classes, (classes) => classes.reactions, { nullable:true })
    classes?:IClasses;

    constructor(user:User, reacao:"like" | "dislike"){
        this.user = user;
        this.reaction = reacao;
    }
    
}