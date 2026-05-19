import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import { initDatabase } from './database/init';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import departmentRoutes from './routes/department';
import doctorRoutes from './routes/doctor';
import appointmentRoutes from './routes/appointment';
import visitRoutes from './routes/visit';
import medicalRecordRoutes from './routes/medicalRecord';
import adminRoutes from './routes/admin';
import dictionaryRoutes from './routes/dictionary';
import uploadRoutes from './routes/upload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

initDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/uploads', express.static(path.join(__dirname, '../..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.warn(`Server is running on port ${config.port}`);
});
