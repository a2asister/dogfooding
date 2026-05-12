import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bill, BillCategory, BillType } from './bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    const bill = this.billRepository.create({
      ...createBillDto,
      date: new Date(createBillDto.date),
    });
    return this.billRepository.save(bill);
  }

  async findAll(month?: string, category?: BillCategory): Promise<Bill[]> {
    const where: any = {};
    
    if (month) {
      const [year, m] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(m), 0);
      where.date = Between(startDate, endDate);
    }
    
    if (category) {
      where.category = category;
    }

    return this.billRepository.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({ where: { id } });
    if (!bill) {
      throw new NotFoundException(`Bill #${id} not found`);
    }
    return bill;
  }

  async getMonthlySummary(month: string) {
    const [year, m] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 0);

    const bills = await this.billRepository.find({
      where: { date: Between(startDate, endDate) },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};

    bills.forEach((bill) => {
      if (bill.type === BillType.INCOME) {
        totalIncome += parseFloat(bill.amount.toString());
      } else {
        totalExpense += parseFloat(bill.amount.toString());
      }
      categoryBreakdown[bill.category] = (categoryBreakdown[bill.category] || 0) + parseFloat(bill.amount.toString());
    });

    return {
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
    };
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);
    if (updateBillDto.date) {
      Object.assign(bill, { ...updateBillDto, date: new Date(updateBillDto.date) });
    } else {
      Object.assign(bill, updateBillDto);
    }
    return this.billRepository.save(bill);
  }

  async remove(id: number): Promise<void> {
    const result = await this.billRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bill #${id} not found`);
    }
  }
}
