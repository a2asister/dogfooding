import { DataSource } from 'typeorm';
import { Medicine } from './src/entities/medicine.entity';
import { MedicineRecord } from './src/entities/medicine-record.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'medicine.db',
  entities: [Medicine, MedicineRecord],
  synchronize: true,
});

const testMedicines = [
  {
    name: '阿莫西林胶囊',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=阿莫西林胶囊药品照片&image_size=square',
    dosage: '每次1粒',
    time: '每日3次',
    description: '用于敏感菌所致的呼吸道、泌尿道、皮肤软组织等感染。',
    precautions: '青霉素过敏者禁用。用药期间避免饮酒。',
    isActive: true,
  },
  {
    name: '布洛芬缓释胶囊',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=布洛芬缓释胶囊药品照片&image_size=square',
    dosage: '每次1粒',
    time: '每日2次',
    description: '用于缓解轻至中度疼痛，如头痛、关节痛、偏头痛、牙痛等。也用于普通感冒或流行性感冒引起的发热。',
    precautions: '胃溃疡患者慎用。不宜长期大量使用。',
    isActive: true,
  },
  {
    name: '维生素C片',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=维生素C片药品照片&image_size=square',
    dosage: '每次1片',
    time: '每日1次',
    description: '补充维生素C，增强免疫力，促进胶原蛋白合成。',
    precautions: '过量服用可能引起腹泻。建议饭后服用。',
    isActive: true,
  },
  {
    name: '复方甘草片',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=复方甘草片药品照片&image_size=square',
    dosage: '每次2片',
    time: '每日3次',
    description: '镇咳祛痰。用于上呼吸道感染、支气管炎引起的咳嗽。',
    precautions: '孕妇及哺乳期妇女慎用。不宜长期服用。',
    isActive: true,
  },
  {
    name: '双黄连口服液',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=双黄连口服液药品照片&image_size=square',
    dosage: '每次1支',
    time: '每日3次',
    description: '疏风解表，清热解毒。用于外感风热所致的感冒。',
    precautions: '风寒感冒者不适用。服药期间忌烟酒。',
    isActive: true,
  },
];

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const medicineRepository = AppDataSource.getRepository(Medicine);
    
    const existingMedicines = await medicineRepository.find();
    if (existingMedicines.length > 0) {
      console.log('Database already has medicines, skipping seed');
      await AppDataSource.destroy();
      return;
    }

    for (const medicine of testMedicines) {
      const newMedicine = medicineRepository.create(medicine);
      await medicineRepository.save(newMedicine);
      console.log(`Created medicine: ${medicine.name}`);
    }

    console.log('Test medicines added successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
}

seed();
