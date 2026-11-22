import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';
import { VacancyCriterion } from './vacancy-criterion.entity';
@Entity('vacancies')
export class Vacancy {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 150 }) name: string;
  @OneToMany(() => VacancyCriterion, criterion => criterion.vacancy, { cascade: true }) criteria: VacancyCriterion[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
