const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDatabase } = require('./database');

function rowToUser(row) {
  if (!row || Object.keys(row).length === 0) return null;
  return {
    _id: row.id,
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    name: row.name,
    avatar: row.avatar,
    roles: row.roles ? JSON.parse(row.roles) : [],
    department: row.department,
    phone: row.phone,
    isActive: row.isActive === 1,
    permissions: row.permissions ? JSON.parse(row.permissions) : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toParams(arr) {
  return arr.map(v => v === undefined ? null : v);
}

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

class User {
  constructor(data) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.avatar = data.avatar;
    this.roles = data.roles || ['user'];
    this.department = data.department;
    this.phone = data.phone;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.permissions = data.permissions || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  async _isNewRecord() {
    const db = getDb();
    const row = queryOne(db, 'SELECT COUNT(*) as count FROM users WHERE id = ?', [this._id]);
    return !row || row.count === 0;
  }

  async save() {
    const db = getDb();
    this.updatedAt = new Date().toISOString();

    const isNew = await this._isNewRecord();

    if (isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      db.run(
        `INSERT INTO users (id, username, email, password, name, avatar, roles, department, phone, isActive, permissions, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        toParams([
          this._id,
          this.username,
          this.email,
          this.password,
          this.name,
          this.avatar,
          JSON.stringify(this.roles),
          this.department,
          this.phone,
          this.isActive ? 1 : 0,
          JSON.stringify(this.permissions),
          this.createdAt,
          this.updatedAt
        ])
      );
    } else {
      db.run(
        `UPDATE users SET username=?, email=?, password=?, name=?, avatar=?, roles=?, department=?, phone=?, isActive=?, permissions=?, updatedAt=? WHERE id=?`,
        toParams([
          this.username,
          this.email,
          this.password,
          this.name,
          this.avatar,
          JSON.stringify(this.roles),
          this.department,
          this.phone,
          this.isActive ? 1 : 0,
          JSON.stringify(this.permissions),
          this.updatedAt,
          this._id
        ])
      );
    }

    saveDatabase();
    return this;
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  static async findOne(query) {
    const db = getDb();
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (query.$or) {
      const orConditions = [];
      query.$or.forEach(cond => {
        if (cond.username) {
          orConditions.push('username = ?');
          params.push(cond.username);
        }
        if (cond.email) {
          orConditions.push('email = ?');
          params.push(cond.email);
        }
      });
      sql += ` AND (${orConditions.join(' OR ')})`;
    } else {
      if (query.username) {
        sql += ' AND username = ?';
        params.push(query.username);
      }
      if (query.email) {
        sql += ' AND email = ?';
        params.push(query.email);
      }
    }

    sql += ' LIMIT 1';

    const row = queryOne(db, sql, params);
    if (!row) return null;

    const userData = rowToUser(row);
    if (!userData) return null;

    const user = new User(userData);
    user.isNew = false;
    return user;
  }

  static async findById(id) {
    const db = getDb();
    const row = queryOne(db, 'SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;

    const userData = rowToUser(row);
    if (!userData) return null;

    const user = new User(userData);
    user.isNew = false;
    return user;
  }

  static async find(query = {}) {
    const db = getDb();
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (query.username) {
      sql += ' AND username = ?';
      params.push(query.username);
    }
    if (query.email) {
      sql += ' AND email = ?';
      params.push(query.email);
    }

    sql += ' ORDER BY createdAt DESC';

    const rows = queryAll(db, sql, params);

    return rows.map(row => {
      const userData = rowToUser(row);
      const user = new User(userData);
      user.isNew = false;
      return user;
    });
  }

  static async findByIdAndDelete(id) {
    const db = getDb();
    const user = await User.findById(id);
    if (!user) return null;

    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
    return user;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const db = getDb();
    const user = await User.findById(id);
    if (!user) return null;

    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }

    Object.keys(update).forEach(key => {
      if (key !== '_id' && key !== 'id') {
        user[key] = update[key];
      }
    });

    user.updatedAt = new Date().toISOString();

    db.run(
      `UPDATE users SET username=?, email=?, password=?, name=?, avatar=?, roles=?, department=?, phone=?, isActive=?, permissions=?, updatedAt=? WHERE id=?`,
      toParams([
        user.username,
        user.email,
        user.password,
        user.name,
        user.avatar,
        JSON.stringify(user.roles),
        user.department,
        user.phone,
        user.isActive ? 1 : 0,
        JSON.stringify(user.permissions),
        user.updatedAt,
        id
      ])
    );

    saveDatabase();
    return user;
  }

  toObject() {
    return {
      _id: this._id,
      id: this._id,
      username: this.username,
      email: this.email,
      password: this.password,
      name: this.name,
      avatar: this.avatar,
      roles: this.roles,
      department: this.department,
      phone: this.phone,
      isActive: this.isActive,
      permissions: this.permissions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
