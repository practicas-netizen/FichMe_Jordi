import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TerminalDevice } from "./terminal-device.entity";
import { ActivationCode } from "./activation-code.entity";
import { TerminalSettings } from "./terminal-settings.entity";
import { TimeEntry } from "./time-entry.entity";
import { TerminalController } from "./terminal.controller";
import { TerminalService } from "./terminal.service";


@Module({
  imports: [ TypeOrmModule.forFeature([TerminalDevice, ActivationCode, TerminalSettings, TimeEntry]) ],
  controllers: [TerminalController],
    providers: [TerminalService],
})
export class TerminalModule {}