import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from './command.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CommandService implements OnModuleInit {
  constructor(
    @InjectRepository(Command)
    private commandRepository: Repository<Command>,
  ) {}

  async onModuleInit() {
    await this.loadPresetCommands();
  }

  private async loadPresetCommands() {
    const presetPath = path.join(__dirname, '../../data/preset-commands.json');
    if (fs.existsSync(presetPath)) {
      const data = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
      for (const item of data) {
        const exists = await this.commandRepository.findOne({ where: { command: item.command } });
        if (!exists) {
          await this.commandRepository.save(item);
        }
      }
    }
  }

  async execute(command: string): Promise<{ response: string; isError: boolean }> {
    const cmd = await this.commandRepository.findOne({ where: { command: command.toLowerCase().trim() } });
    if (cmd) {
      return { response: cmd.response, isError: cmd.isError };
    }

    return {
      response: `Command not found: ${command}\nType 'help' for available commands.`,
      isError: true,
    };
  }

  async getAllCommands(): Promise<Command[]> {
    return this.commandRepository.find();
  }
}
