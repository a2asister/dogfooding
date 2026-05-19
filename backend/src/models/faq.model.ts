import db from '../database/db';

export interface FAQ {
  id: number;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
  category: string;
  sort_order: number;
  is_enabled: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export const faqModel = {
  getAll: (category?: string, keyword?: string, lang: string = 'zh-CN'): FAQ[] => {
    let sql = 'SELECT * FROM faqs WHERE is_enabled = 1';
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      if (lang === 'en') {
        sql += ' AND (question_en LIKE ? OR answer_en LIKE ?)';
      } else {
        sql += ' AND (question LIKE ? OR answer LIKE ?)';
      }
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    return db.prepare(sql).all(...params) as FAQ[];
  },

  getById: (id: number): FAQ | undefined => {
    return db.prepare('SELECT * FROM faqs WHERE id = ?').get(id) as FAQ | undefined;
  },

  create: (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at' | 'view_count'>): number => {
    const stmt = db.prepare(`
      INSERT INTO faqs (question, question_en, answer, answer_en, category, sort_order, is_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      faq.question,
      faq.question_en || '',
      faq.answer,
      faq.answer_en || '',
      faq.category,
      faq.sort_order || 0,
      faq.is_enabled ?? 1
    );
    return result.lastInsertRowid as number;
  },

  update: (id: number, faq: Partial<FAQ>): void => {
    const fields = [];
    const params: any[] = [];

    if (faq.question !== undefined) { fields.push('question = ?'); params.push(faq.question); }
    if (faq.question_en !== undefined) { fields.push('question_en = ?'); params.push(faq.question_en); }
    if (faq.answer !== undefined) { fields.push('answer = ?'); params.push(faq.answer); }
    if (faq.answer_en !== undefined) { fields.push('answer_en = ?'); params.push(faq.answer_en); }
    if (faq.category !== undefined) { fields.push('category = ?'); params.push(faq.category); }
    if (faq.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(faq.sort_order); }
    if (faq.is_enabled !== undefined) { fields.push('is_enabled = ?'); params.push(faq.is_enabled); }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  },

  delete: (id: number): void => {
    db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
  },

  incrementViewCount: (id: number): void => {
    db.prepare('UPDATE faqs SET view_count = view_count + 1 WHERE id = ?').run(id);
  },

  getCategories: (): { category: string; count: number }[] => {
    return db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM faqs 
      WHERE is_enabled = 1 
      GROUP BY category 
      ORDER BY count DESC
    `).all() as { category: string; count: number }[];
  }
};
