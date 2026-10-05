
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity( { name: 'employees' } )
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ length: 6 })
  pin!: string;

  @Column()
  active!: boolean;

  @Column({ name: 'created_at' })
  createdAt!: Date;
}


