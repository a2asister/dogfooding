import { StorageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import type {
  User,
  Department,
  Doctor,
  Medication,
  Ward,
  Bed,
  Patient,
  Equipment,
} from '../types';

export function initializeData(): void {
  if (StorageService.get<User[]>(STORAGE_KEYS.USERS)?.length) {
    return;
  }

  const users: User[] = [
    {
      id: StorageService.generateId(),
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: '系统管理员',
      phone: '13800000000',
      email: 'admin@hospital.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'doctor1',
      password: 'doctor123',
      role: 'medical',
      name: '张医生',
      phone: '13800000001',
      email: 'doctor1@hospital.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'doctor2',
      password: 'doctor123',
      role: 'medical',
      name: '李医生',
      phone: '13800000002',
      email: 'doctor2@hospital.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'nurse1',
      password: 'nurse123',
      role: 'medical',
      name: '王护士',
      phone: '13800000003',
      email: 'nurse1@hospital.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'charge1',
      password: 'charge123',
      role: 'charge',
      name: '赵收费',
      phone: '13800000004',
      email: 'charge1@hospital.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'patient1',
      password: 'patient123',
      role: 'patient',
      name: '患者张三',
      phone: '13900000001',
      email: 'patient1@example.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      username: 'patient2',
      password: 'patient123',
      role: 'patient',
      name: '患者李四',
      phone: '13900000002',
      email: 'patient2@example.com',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const departments: Department[] = [
    {
      id: StorageService.generateId(),
      name: '内科',
      description: '内科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '外科',
      description: '外科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '儿科',
      description: '儿科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '妇产科',
      description: '妇产科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '眼科',
      description: '眼科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '耳鼻喉科',
      description: '耳鼻喉科诊疗中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '检验科',
      description: '医学检验中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '放射科',
      description: '医学影像中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '药剂科',
      description: '药品管理中心',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const doctors: Doctor[] = [
    {
      id: StorageService.generateId(),
      userId: users[1].id,
      departmentId: departments[0].id,
      title: '主任医师',
      specialization: '心血管内科',
      licenseNumber: 'DOC20240001',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      userId: users[2].id,
      departmentId: departments[1].id,
      title: '副主任医师',
      specialization: '普外科',
      licenseNumber: 'DOC20240002',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const medications: Medication[] = [
    {
      id: StorageService.generateId(),
      name: '阿莫西林胶囊',
      genericName: '阿莫西林',
      category: '抗生素',
      unit: '盒',
      price: 25.5,
      manufacturer: '某制药有限公司',
      description: '用于敏感菌所致的感染',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '布洛芬缓释胶囊',
      genericName: '布洛芬',
      category: '止痛药',
      unit: '盒',
      price: 18.0,
      manufacturer: '某制药有限公司',
      description: '用于缓解轻至中度疼痛',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '复方感冒灵颗粒',
      genericName: '感冒灵',
      category: '中成药',
      unit: '盒',
      price: 15.0,
      manufacturer: '某中药厂',
      description: '用于感冒引起的头痛、发热',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '维生素C片',
      genericName: '维生素C',
      category: '非处方药',
      unit: '瓶',
      price: 8.5,
      manufacturer: '某制药有限公司',
      description: '用于预防和治疗坏血病',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '头孢克洛干混悬剂',
      genericName: '头孢克洛',
      category: '抗生素',
      unit: '盒',
      price: 35.0,
      manufacturer: '某制药有限公司',
      description: '用于敏感菌所致的呼吸道感染',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const wards: Ward[] = [
    {
      id: StorageService.generateId(),
      name: '内科一病房',
      departmentId: departments[0].id,
      floor: '3楼',
      description: '内科住院病房',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '外科一病房',
      departmentId: departments[1].id,
      floor: '5楼',
      description: '外科住院病房',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: 'ICU病房',
      departmentId: departments[0].id,
      floor: '2楼',
      description: '重症监护病房',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const beds: Bed[] = [
    {
      id: StorageService.generateId(),
      wardId: wards[0].id,
      bedNumber: '301-1',
      bedType: 'general',
      status: 'available',
      dailyRate: 50,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      wardId: wards[0].id,
      bedNumber: '301-2',
      bedType: 'general',
      status: 'available',
      dailyRate: 50,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      wardId: wards[0].id,
      bedNumber: '302-1',
      bedType: 'general',
      status: 'available',
      dailyRate: 50,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      wardId: wards[1].id,
      bedNumber: '501-1',
      bedType: 'general',
      status: 'available',
      dailyRate: 50,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      wardId: wards[2].id,
      bedNumber: 'ICU-1',
      bedType: 'icu',
      status: 'available',
      dailyRate: 200,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      wardId: wards[2].id,
      bedNumber: 'ICU-2',
      bedType: 'icu',
      status: 'available',
      dailyRate: 200,
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const patients: Patient[] = [
    {
      id: StorageService.generateId(),
      userId: users[5].id,
      name: '患者张三',
      gender: 'male',
      birthDate: '1985-05-15',
      idCard: '110101198505151234',
      phone: '13900000001',
      address: '北京市朝阳区某某小区',
      bloodType: 'A+',
      emergencyContact: '张夫人',
      emergencyPhone: '13900000002',
      medicalHistory: '高血压病史5年',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      userId: users[6].id,
      name: '患者李四',
      gender: 'female',
      birthDate: '1992-08-20',
      idCard: '110102199208205678',
      phone: '13900000003',
      address: '北京市海淀区某某街道',
      bloodType: 'B+',
      emergencyContact: '李先生',
      emergencyPhone: '13900000004',
      medicalHistory: '无特殊病史',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  const equipment: Equipment[] = [
    {
      id: StorageService.generateId(),
      name: '心电图机',
      equipmentType: '检查设备',
      model: 'ECG-2024',
      serialNumber: 'SN-ECG-001',
      manufacturer: '某医疗器械公司',
      purchaseDate: '2023-06-15',
      warrantyExpiry: '2026-06-14',
      location: '内科诊室1',
      status: 'active',
      lastMaintenanceDate: '2024-01-15',
      nextMaintenanceDate: '2024-07-15',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: 'X光机',
      equipmentType: '影像设备',
      model: 'XRAY-5000',
      serialNumber: 'SN-XRAY-001',
      manufacturer: '某影像设备公司',
      purchaseDate: '2022-12-01',
      warrantyExpiry: '2025-11-30',
      location: '放射科',
      status: 'active',
      lastMaintenanceDate: '2024-02-01',
      nextMaintenanceDate: '2024-08-01',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: 'CT扫描仪',
      equipmentType: '影像设备',
      model: 'CT-64Slice',
      serialNumber: 'SN-CT-001',
      manufacturer: '某影像设备公司',
      purchaseDate: '2023-03-10',
      warrantyExpiry: '2026-03-09',
      location: '放射科',
      status: 'maintenance',
      lastMaintenanceDate: '2024-03-10',
      nextMaintenanceDate: '2024-09-10',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
    {
      id: StorageService.generateId(),
      name: '呼吸机',
      equipmentType: '急救设备',
      model: 'VENT-2024',
      serialNumber: 'SN-VENT-001',
      manufacturer: '某医疗器械公司',
      purchaseDate: '2023-08-20',
      warrantyExpiry: '2026-08-19',
      location: 'ICU病房',
      status: 'active',
      lastMaintenanceDate: '2024-02-20',
      nextMaintenanceDate: '2024-08-20',
      createdAt: StorageService.getNow(),
      updatedAt: StorageService.getNow(),
    },
  ];

  StorageService.set(STORAGE_KEYS.USERS, users);
  StorageService.set(STORAGE_KEYS.DEPARTMENTS, departments);
  StorageService.set(STORAGE_KEYS.DOCTORS, doctors);
  StorageService.set(STORAGE_KEYS.MEDICATIONS, medications);
  StorageService.set(STORAGE_KEYS.WARDS, wards);
  StorageService.set(STORAGE_KEYS.BEDS, beds);
  StorageService.set(STORAGE_KEYS.PATIENTS, patients);
  StorageService.set(STORAGE_KEYS.EQUIPMENT, equipment);
  StorageService.set(STORAGE_KEYS.OPERATION_LOGS, []);
  StorageService.set(STORAGE_KEYS.APPOINTMENTS, []);
  StorageService.set(STORAGE_KEYS.MEDICAL_RECORDS, []);
  StorageService.set(STORAGE_KEYS.PRESCRIPTIONS, []);
  StorageService.set(STORAGE_KEYS.PRESCRIPTION_ITEMS, []);
  StorageService.set(STORAGE_KEYS.LAB_TEST_ORDERS, []);
  StorageService.set(STORAGE_KEYS.IMAGING_ORDERS, []);
  StorageService.set(STORAGE_KEYS.INVENTORY, []);
  StorageService.set(STORAGE_KEYS.ORDERS, []);
  StorageService.set(STORAGE_KEYS.ORDER_ITEMS, []);
  StorageService.set(STORAGE_KEYS.ADMISSIONS, []);
  StorageService.set(STORAGE_KEYS.NURSING_RECORDS, []);
  StorageService.set(STORAGE_KEYS.INFECTION_RISKS, []);
  StorageService.set(STORAGE_KEYS.MAINTENANCE_RECORDS, []);
}
