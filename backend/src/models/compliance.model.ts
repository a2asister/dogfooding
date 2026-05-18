import db from '../database/db';
import type { ComplianceDoc } from '../types';

export const complianceModel = {
  getAll(): ComplianceDoc[] {
    return db.prepare('SELECT * FROM compliance_docs ORDER BY id ASC').all() as ComplianceDoc[];
  },

  getByType(docType: string): ComplianceDoc | undefined {
    return db.prepare('SELECT * FROM compliance_docs WHERE doc_type = ?').get(docType) as ComplianceDoc | undefined;
  },

  update(docType: string, data: { title?: string; content?: string }): boolean {
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    values.push(docType);
    
    const result = db.prepare(`UPDATE compliance_docs SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE doc_type = ?`).run(...values);
    return result.changes > 0;
  }
};
