import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TerminalDevice } from "./terminal-device.entity";

@Entity({ name: 'activation_codes' })
export class ActivationCode {
    @ManyToOne(() => TerminalDevice, { nullable: true })
    @JoinColumn({ name: 'device_id' })
    terminalDevice!: TerminalDevice | null;

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 20 })
    code!: string;

    @Column( { name: 'expires_at', precision: 3, type: 'datetime', nullable: true } )
    expiresAt!: Date | null;

    @Column( { name: 'used_at', precision: 3, type: 'datetime', nullable: true } )
    usedAt!: Date | null;

    @Column( { name: 'created_at', precision: 3, type: 'datetime' } )
    createdAt!: Date;
}
