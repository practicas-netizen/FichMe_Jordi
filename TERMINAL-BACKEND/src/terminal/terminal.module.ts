import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TerminalDevice } from "./terminal-device.entity";
import { ActivationCode } from "./activation-code.entity";
import { TerminalSettings } from "./terminal-settings.entity";
import { TimeEntry } from "./time-entry.entity";
import { TerminalController } from "./terminal.controller";
import { TerminalService } from "./terminal.service";
import { DeviceAuthGuard } from "./device-auth.guard";


@Module({
  exports: [TypeOrmModule],
  imports: [ TypeOrmModule.forFeature([TerminalDevice, ActivationCode, TerminalSettings, TimeEntry]) ],
  controllers: [TerminalController],
    providers: [TerminalService, DeviceAuthGuard],
})
export class TerminalModule {}