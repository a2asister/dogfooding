import { Controller, Post, Get, Body } from '@nestjs/common';
import { CommandService } from './command.service';

@Controller('api/command')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @Post('execute')
  async execute(@Body() body: { command: string }) {
    return this.commandService.execute(body.command);
  }

  @Get('list')
  async list() {
    return this.commandService.getAllCommands();
  }
}
