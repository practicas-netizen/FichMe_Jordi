import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { TerminalDevice } from './terminal-device.entity';

export enum TimeEntryType {
  IN = 'in',
  OUT = 'out',
}

@Entity({ name: 'time_entries' })
export class TimeEntry {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'enum', enum: TimeEntryType })
  type!: TimeEntryType;

  @Column({ name: 'clocked_at', type: 'datetime', precision: 3 })
  clockedAt!: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => TerminalDevice, { nullable: true })
  @JoinColumn({ name: 'device_id' })
  terminalDevice!: TerminalDevice | null;
}