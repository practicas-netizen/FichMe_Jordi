import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'companies' })
export class Companies {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 160 })
  name!: string;

  @Column({ length: 9 })
  NIF!: string;

  @Column({ length: 15 })
  phone!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ length: 34 })
  IBAN!: string;
}