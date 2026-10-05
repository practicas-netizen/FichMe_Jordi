import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TerminalDeviceStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked'
}

@Entity( { name: 'terminal_devices' } )
export class TerminalDevice {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column( { length: 80 } )
    name!: string;

    @Column( { select: false, length: 64, type: 'varchar', name: 'token_hash' } )
    tokenHash!: string;

    @Column( { select: false, length: 255, type: 'varchar', nullable: true, name: 'admin_pin_hash' } )
    adminPinHash!: string | null;

    @Column({ type: 'enum', enum: TerminalDeviceStatus })
    status!: TerminalDeviceStatus;

    @Column({ name: 'activated_at', precision: 3, type: 'datetime' })
    activatedAt!: Date;

    @Column({ name: 'last_seen_at', precision: 3, type: 'datetime', nullable: true })
    lastSeenAt!: Date | null;

    @Column({ name: 'revoked_at', precision: 3, type: 'datetime', nullable: true })
    revokedAt!: Date | null;
}