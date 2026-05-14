import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  favoriteColors: string[];

  @Column('simple-array')
  preferredStyles: string[];

  @Column({ default: 'balanced' })
  colorScheme: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
