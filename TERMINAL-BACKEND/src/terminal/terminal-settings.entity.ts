import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn,  } from "typeorm";
import { TerminalDevice } from "./terminal-device.entity";

export enum DateFormat { SHORT = 'short', LONG = 'long' }


@Entity({ name: 'terminal_settings' })
export class TerminalSettings {
  @PrimaryColumn({ name: 'device_id', type: 'int' })
    deviceId!: number;
  @OneToOne(() => TerminalDevice, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'device_id' })
    terminalDevice!: TerminalDevice;

    @Column( { name: 'onboarding_completed' } )
    onboardingCompleted!: boolean;

    @Column( { name: 'company_name', type: 'varchar', length: 120 } )
    companyName!: string;

    @Column( { name: 'logo', type: 'mediumtext', nullable: true } )
    logo!: string | null;

    @Column( { name: 'background_color', type: 'varchar', length: 9 } )
    backgroundColor!: string;

    @Column( { name: 'pin_button_color', type: 'varchar', length: 9 } )
    pinButtonColor!: string;

    @Column( { name: 'date_format', type: 'enum', enum: DateFormat } )
    dateFormat!: DateFormat;

    @Column( { name: 'updated_at', precision: 3, type: 'datetime' } )
    updatedAt!: Date;
}
