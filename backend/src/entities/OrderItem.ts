import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Note } from './Note';
import { Product } from './Product';
import { User } from './User';

export enum ItemType {
  MEMBERSHIP_PLAN = 'membership_plan',
  PROMOTION_PLAN = 'promotion_plan',
  PRIVATE_NOTE = 'private_note',
  PRODUCT = 'product',
  VIRTUAL_GIFT = 'virtual_gift',
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column()
  orderId: string;

  @Column({
    type: 'simple-enum',
    enum: ItemType,
  })
  itemType: ItemType;

  @Column({ nullable: true })
  itemId: string;

  @Column()
  itemName: string;

  @Column({ type: 'text', nullable: true })
  itemDescription: string;

  @Column({ type: 'simple-json', nullable: true })
  itemImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @ManyToOne(() => User, { nullable: true })
  seller: User;

  @Column({ nullable: true })
  sellerId: string;

  @ManyToOne(() => Note, { nullable: true })
  note: Note;

  @Column({ nullable: true })
  noteId: string;

  @ManyToOne(() => Product, { nullable: true })
  product: Product;

  @Column({ nullable: true })
  productId: string;

  @CreateDateColumn()
  createdAt: Date;
}
