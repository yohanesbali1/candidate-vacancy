import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('candidates')
@Index(['email'], { unique: true })
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'date' })
  birthday: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'double precision' })
  currentSalary: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}