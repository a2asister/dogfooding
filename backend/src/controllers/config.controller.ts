import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService, AnimationConfig } from '../services/config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('validate')
  validate(@Body() config: AnimationConfig): { valid: boolean; errors: string[] } {
    return this.configService.validate(config);
  }
}