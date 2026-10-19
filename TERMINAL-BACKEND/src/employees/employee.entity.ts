import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'company_id' })
  companyId!: number;

  @Column()
  name!: string;

  @Column({ length: 6 })
  pin!: string;

  @Column()
  active!: boolean;

  @Column({ name: 'created_at' })
  createdAt!: Date;
}