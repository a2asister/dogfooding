import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class DeviceConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  deviceName!: string;

  @Column()
  screenWidth!: number;

  @Column()
  screenHeight!: number;

  @Column({ default: 60 })
  refreshRate!: number;

  @Column('simple-json')
  effectSettings!: {
    microMovement: number;
    gravitySensitivity: number;
    pressIntensity: number;
    transitionSpeed: number;
  };

  @CreateDateColumn()
  createdAt!: Date;
}