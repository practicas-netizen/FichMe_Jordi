import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TerminalDevice } from "./terminal-device.entity";
import { ActivationCode } from "./activation-code.entity";
import { TerminalSettings } from "./terminal-settings.entity";
import { TimeEntry } from "./time-entry.entity";


@Module({
  imports: [ TypeOrmModule.forFeature([TerminalDevice, ActivationCode, TerminalSettings, TimeEntry]) ],
  controllers: [ ],
    providers: [],
})
export class TerminalModule {}