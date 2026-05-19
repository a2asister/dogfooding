import { createTestDb, closeTestDb, clearTables } from './testDb';

beforeAll(() => {
  createTestDb();
});

afterEach(() => {
  clearTables();
});

afterAll(() => {
  closeTestDb();
});
