import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { SavedFormula } from '../data/data.service';
import { DataService } from '../data/data.service';

@Controller('api/formulas')
export class FormulasController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  getFormulas(): SavedFormula[] {
    return this.dataService.getFormulas();
  }

  @Post()
  addFormula(
    @Body() body: { name: string; expression: string },
  ): SavedFormula {
    return this.dataService.addFormula({
      name: body.name,
      expression: body.expression,
    });
  }

  @Delete(':id')
  deleteFormula(@Param('id') id: string): { success: boolean } {
    const success = this.dataService.deleteFormula(id);
    return { success };
  }
}
