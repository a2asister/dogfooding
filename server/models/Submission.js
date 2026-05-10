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

function rowToSubmission(row) {
  if (!row || Object.keys(row).length === 0) return null;
  return {
    _id: row.id,
    id: row.id,
    formId: row.formId,
    formVersion: row.formVersion || 1,
    data: row.data ? JSON.parse(row.data) : {},
    status: row.status || 'draft',
    currentWorkflowStep: row.currentWorkflowStep,
    workflowHistory: row.workflowHistory ? JSON.parse(row.workflowHistory) : [],
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    validationErrors: row.validationErrors ? JSON.parse(row.validationErrors) : [],
    isRead: row.isRead === 1,
    isStarred: row.isStarred === 1,
    tags: row.tags ? JSON.parse(row.tags) : [],
    assignee: row.assignee,
    approvers: row.approvers ? JSON.parse(row.approvers) : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

class Submission {
  constructor(data) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.formId = data.formId;
    this.formVersion = data.formVersion || 1;
    this.data = data.data || {};
    this.status = data.status || 'draft';
    this.currentWorkflowStep = data.currentWorkflowStep;
    this.workflowHistory = data.workflowHistory || [];
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.validationErrors = data.validationErrors || [];
    this.isRead = data.isRead || false;
    this.isStarred = data.isStarred || false;
    this.tags = data.tags || [];
    this.assignee = data.assignee;
    this.approvers = data.approvers || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isNew = true;
  }

  async _isNewRecord() {
    const db = getDb();
    const row = queryOne(db, 'SELECT COUNT(*) as count FROM submissions WHERE id = ?', [this._id]);
    return !row || row.count === 0;
  }

  async save() {
    const db = getDb();
    this.updatedAt = new Date().toISOString();

    const isNew = await this._isNewRecord();
    this.isNew = isNew;

    if (isNew) {
      db.run(
        `INSERT INTO submissions (id, formId, formVersion, data, status, currentWorkflowStep, workflowHistory, createdBy, updatedBy, validationErrors, isRead, isStarred, tags, assignee, approvers, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        toParams([
          this._id,
          this.formId,
          this.formVersion,
          JSON.stringify(this.data),
          this.status,
          this.currentWorkflowStep,
          JSON.stringify(this.workflowHistory),
          this.createdBy,
          this.updatedBy,
          JSON.stringify(this.validationErrors),
          this.isRead ? 1 : 0,
          this.isStarred ? 1 : 0,
          JSON.stringify(this.tags),
          this.assignee,
          JSON.stringify(this.approvers),
          this.createdAt,
          this.updatedAt
        ])
      );
    } else {
      db.run(
        `UPDATE submissions SET formId=?, formVersion=?, data=?, status=?, currentWorkflowStep=?, workflowHistory=?, createdBy=?, updatedBy=?, validationErrors=?, isRead=?, isStarred=?, tags=?, assignee=?, approvers=?, updatedAt=? WHERE id=?`,
        toParams([
          this.formId,
          this.formVersion,
          JSON.stringify(this.data),
          this.status,
          this.currentWorkflowStep,
          JSON.stringify(this.workflowHistory),
          this.createdBy,
          this.updatedBy,
          JSON.stringify(this.validationErrors),
          this.isRead ? 1 : 0,
          this.isStarred ? 1 : 0,
          JSON.stringify(this.tags),
          this.assignee,
          JSON.stringify(this.approvers),
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
    let sql = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (query.formId) {
      sql += ' AND formId = ?';
      params.push(query.formId);
    }
    if (query.status) {
      sql += ' AND status = ?';
      params.push(query.status);
    }
    if (query.createdBy) {
      sql += ' AND createdBy = ?';
      params.push(query.createdBy);
    }
    if (query.$or) {
      const orConditions = [];
      query.$or.forEach(cond => {
        if (cond.assignee) {
          orConditions.push('assignee = ?');
          params.push(cond.assignee);
        }
        if (cond.status) {
          orConditions.push('status = ?');
          params.push(cond.status);
        }
      });
      if (orConditions.length > 0) {
        sql += ` AND (${orConditions.join(' OR ')})`;
      }
    }

    sql += ' ORDER BY createdAt DESC';

    const rows = queryAll(db, sql, params);

    return rows.map(row => {
      const submissionData = rowToSubmission(row);
      const submission = new Submission(submissionData);
      submission.isNew = false;
      return submission;
    });
  }

  static async findById(id) {
    const db = getDb();
    const row = queryOne(db, 'SELECT * FROM submissions WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;

    const submissionData = rowToSubmission(row);
    if (!submissionData) return null;

    const submission = new Submission(submissionData);
    submission.isNew = false;
    return submission;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const db = getDb();
    const submission = await Submission.findById(id);
    if (!submission) return null;

    Object.keys(update).forEach(key => {
      if (key !== '_id' && key !== 'id') {
        submission[key] = update[key];
      }
    });

    submission.updatedAt = new Date().toISOString();
    submission.isNew = false;

    await submission.save();
    return submission;
  }

  static async findByIdAndDelete(id) {
    const db = getDb();
    const submission = await Submission.findById(id);
    if (!submission) return null;

    db.run('DELETE FROM submissions WHERE id = ?', [id]);
    saveDatabase();
    return submission;
  }

  toObject() {
    return {
      _id: this._id,
      id: this._id,
      formId: this.formId,
      formVersion: this.formVersion,
      data: this.data,
      status: this.status,
      currentWorkflowStep: this.currentWorkflowStep,
      workflowHistory: this.workflowHistory,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      validationErrors: this.validationErrors,
      isRead: this.isRead,
      isStarred: this.isStarred,
      tags: this.tags,
      assignee: this.assignee,
      approvers: this.approvers,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Submission;
