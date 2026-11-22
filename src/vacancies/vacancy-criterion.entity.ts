import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Vacancy } from './vacancy.entity';
export enum CriterionType { AGE = 'age', GENDER = 'gender', SALARY = 'salary' }
@Entity('vacancy_criteria')
@Index(['vacancyId'])
export class VacancyCriterion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) vacancyId: string;
  @ManyToOne(() => Vacancy, vacancy => vacancy.criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancyId' }) vacancy: Vacancy;
  @Column({ type: 'varchar', length: 30 }) type: CriterionType | string;
  @Column({ type: 'jsonb' }) details: Record<string, any>;
  @Column({ type: 'int', default: 1 }) weight: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
