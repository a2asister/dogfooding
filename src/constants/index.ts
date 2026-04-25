export const STORAGE_KEYS = {
  USERS: 'hospital_users',
  DEPARTMENTS: 'hospital_departments',
  DOCTORS: 'hospital_doctors',
  PATIENTS: 'hospital_patients',
  APPOINTMENTS: 'hospital_appointments',
  MEDICAL_RECORDS: 'hospital_medical_records',
  PRESCRIPTIONS: 'hospital_prescriptions',
  PRESCRIPTION_ITEMS: 'hospital_prescription_items',
  LAB_TEST_ORDERS: 'hospital_lab_test_orders',
  IMAGING_ORDERS: 'hospital_imaging_orders',
  MEDICATIONS: 'hospital_medications',
  INVENTORY: 'hospital_inventory',
  ORDERS: 'hospital_orders',
  ORDER_ITEMS: 'hospital_order_items',
  WARDS: 'hospital_wards',
  BEDS: 'hospital_beds',
  ADMISSIONS: 'hospital_admissions',
  NURSING_RECORDS: 'hospital_nursing_records',
  INFECTION_RISKS: 'hospital_infection_risks',
  EQUIPMENT: 'hospital_equipment',
  MAINTENANCE_RECORDS: 'hospital_maintenance_records',
  OPERATION_LOGS: 'hospital_operation_logs',
  CURRENT_USER: 'hospital_current_user',
};

export const TIME_SLOTS = [
  '08:00-08:30',
  '08:30-09:00',
  '09:00-09:30',
  '09:30-10:00',
  '10:00-10:30',
  '10:30-11:00',
  '11:00-11:30',
  '11:30-12:00',
  '14:00-14:30',
  '14:30-15:00',
  '15:00-15:30',
  '15:30-16:00',
  '16:00-16:30',
  '16:30-17:00',
  '17:00-17:30',
];

export const MEDICATION_CATEGORIES = [
  '处方药',
  '非处方药',
  '中成药',
  '抗生素',
  '止痛药',
  '注射剂',
  '外用药',
  '输液',
  '耗材',
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '未知'];

export const DOCTOR_TITLES = ['实习医师', '住院医师', '主治医师', '副主任医师', '主任医师'];

export const WARD_TYPES = ['内科病房', '外科病房', '儿科病房', '妇产科病房', 'ICU', 'CCU', '康复科'];
