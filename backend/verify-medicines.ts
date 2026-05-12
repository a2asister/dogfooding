import { DataSource } from 'typeorm';
import { Medicine } from './src/entities/medicine.entity';
import { MedicineRecord } from './src/entities/medicine-record.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'medicine.db',
  entities: [Medicine, MedicineRecord],
  synchronize: true,
});

async function verify() {
  try {
    await AppDataSource.initialize();
    const medicineRepository = AppDataSource.getRepository(Medicine);
    const medicines = await medicineRepository.find();
    
    console.log(`Total medicines in database: ${medicines.length}`);
    console.log('------------------------');
    medicines.forEach((med, index) => {
      console.log(`${index + 1}. ${med.name}`);
      console.log(`   剂量: ${med.dosage}`);
      console.log(`   时间: ${med.time}`);
      console.log('---');
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error verifying medicines:', error);
  }
}

verify();
