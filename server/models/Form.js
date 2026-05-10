const { v4: uuidv4 } = require('uuid');
const { getDb, saveDatabase } = require('./database');

function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function toParams(arr) {
  return arr.map(v => v === undefined ? null : v);
}

function rowToForm(row) {
  if (!row || Object.keys(row).length === 0) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category || '通用',
    fields: row.fields ? JSON.parse(row.fields) : [],
    layout: row.layout ? JSON.parse(row.layout) : { type: 'flex', columns: 1, gutter: 16 },
    rules: row.rules ? JSON.parse(row.rules) : {},
    linkage: row.linkage ? JSON.parse(row.linkage) : {},
    workflows: row.workflows ? JSON.parse(row.workflows) : [],
    permissions: row.permissions ? JSON.parse(row.permissions) : {},
    createdBy: row.createdBy,
    status: row.status || 'draft',
    version: row.version || 1,
    isTemplate: row.isTemplate === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

class Form {
  constructor(data) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category || '通用';
    this.fields = data.fields || [];
    this.layout = data.layout || { type: 'flex', columns: 1, gutter: 16 };
    this.rules = data.rules || {};
    this.linkage = data.linkage || {};
    this.workflows = data.workflows || [];
    this.permissions = data.permissions || {};
    this.createdBy = data.createdBy;
    this.status = data.status || 'draft';
    this.version = data.version || 1;
    this.isTemplate = data.isTemplate || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isNew = true;
  }

  async _isNewRecord() {
    const db = getDb();
    const row = queryOne(db, 'SELECT COUNT(*) as count FROM forms WHERE id = ?', [this._id]);
    return !row || row.count === 0;
  }

  async save() {
    const db = getDb();
    this.updatedAt = new Date().toISOString();

    const isNew = await this._isNewRecord();
    this.isNew = isNew;

    if (isNew) {
      db.run(
        `INSERT INTO forms (id, name, description, category, fields, layout, rules, linkage, workflows, permissions, createdBy, status, version, isTemplate, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        toParams([
          this._id,
          this.name,
          this.description,
          this.category,
          JSON.stringify(this.fields),
          JSON.stringify(this.layout),
          JSON.stringify(this.rules),
          JSON.stringify(this.linkage),
          JSON.stringify(this.workflows),
          JSON.stringify(this.permissions),
          this.createdBy,
          this.status,
          this.version,
          this.isTemplate ? 1 : 0,
          this.createdAt,
          this.updatedAt
        ])
      );
    } else {
      db.run(
        `UPDATE forms SET name=?, description=?, category=?, fields=?, layout=?, rules=?, linkage=?, workflows=?, permissions=?, createdBy=?, status=?, version=?, isTemplate=?, updatedAt=? WHERE id=?`,
        toParams([
          this.name,
          this.description,
          this.category,
          JSON.stringify(this.fields),
          JSON.stringify(this.layout),
          JSON.stringify(this.rules),
          JSON.stringify(this.linkage),
          JSON.stringify(this.workflows),
          JSON.stringify(this.permissions),
          this.createdBy,
          this.status,
          this.version,
          this.isTemplate ? 1 : 0,
          this.updatedAt,
          this._id
        ])
      );
    }

    saveDatabase();
    return this;
  }

  static async find(query = {}) {
    const db = getDb();
    let sql = 'SELECT * FROM forms WHERE 1=1';
    const params = [];

    if (query.category) {
      sql += ' AND category = ?';
      params.push(query.category);
    }
    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }
    if (query.isTemplate !== undefined) {
      sql += ' AND isTemplate = ?';
      params.push(query.isTemplate ? 1 : 0);
    }

    sql += ' ORDER BY createdAt DESC';

    const rows = queryAll(db, sql, params);

    return rows.map(row => {
      const formData = rowToForm(row);
      const form = new Form(formData);
      form.isNew = false;
      return form;
    });
  }

  static async findById(id) {
    const db = getDb();
    const row = queryOne(db, 'SELECT * FROM forms WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;

    const formData = rowToForm(row);
    if (!formData) return null;

    const form = new Form(formData);
    form.isNew = false;
    return form;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const db = getDb();
    const form = await Form.findById(id);
    if (!form) return null;

    Object.keys(update).forEach(key => {
      if (key !== '_id' && key !== 'id') {
        form[key] = update[key];
      }
    });

    if (options.new !== false) {
      form.version = update.version ? update.version : (form.version + 1);
    }

    form.updatedAt = new Date().toISOString();
    form.isNew = false;

    await form.save();
    return form;
  }

  static async findByIdAndDelete(id) {
    const db = getDb();
    const form = await Form.findById(id);
    if (!form) return null;

    db.run('DELETE FROM forms WHERE id = ?', [id]);
    saveDatabase();
    return form;
  }

  static async distinct(field, query = {}) {
    const db = getDb();
    let sql = `SELECT DISTINCT ${field} FROM forms WHERE 1=1`;
    const params = [];

    if (query.isTemplate !== undefined) {
      sql += ' AND isTemplate = ?';
      params.push(query.isTemplate ? 1 : 0);
    }

    const rows = queryAll(db, sql, params);
    return rows.map(row => row[field]).filter(v => v !== null && v !== undefined);
  }

  toObject() {
    return {
      _id: this._id,
      id: this._id,
      name: this.name,
      description: this.description,
      category: this.category,
      fields: this.fields,
      layout: this.layout,
      rules: this.rules,
      linkage: this.linkage,
      workflows: this.workflows,
      permissions: this.permissions,
      createdBy: this.createdBy,
      status: this.status,
      version: this.version,
      isTemplate: this.isTemplate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Form;
