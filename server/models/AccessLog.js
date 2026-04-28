const { Model, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

class AccessLog extends Model {
  // 记录访问日志
  static async logAccess(ctx) {
    return await this.create({
      ip_address: ctx.ip,
      path: ctx.path,
      method: ctx.method,
      user_agent: ctx.get('User-Agent')
    });
  }

  // 检查 IP 在指定时间内的访问次数
  static async checkIPAccessCount(ipAddress, limitMinutes = 1, maxCount = 100) {
    const timeAgo = new Date(Date.now() - limitMinutes * 60 * 1000);
    const count = await this.count({
      where: {
        ip_address: ipAddress,
        created_at: {
          [Op.gte]: timeAgo
        }
      }
    });
    return count;
  }

  // 检查特定路径的访问次数
  static async checkPathAccessCount(ipAddress, path, limitMinutes = 1, maxCount = 10) {
    const timeAgo = new Date(Date.now() - limitMinutes * 60 * 1000);
    const count = await this.count({
      where: {
        ip_address: ipAddress,
        path: path,
        created_at: {
          [Op.gte]: timeAgo
        }
      }
    });
    return count;
  }

  // 清理旧的访问日志（保留最近7天）
  static async cleanOldLogs(days = 7) {
    const timeAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await this.destroy({
      where: {
        created_at: {
          [Op.lt]: timeAgo
        }
      }
    });
  }
}

AccessLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: '访问 IP 地址'
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '访问路径'
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User-Agent'
    }
  },
  {
    sequelize,
    modelName: 'AccessLog',
    tableName: 'access_logs',
    comment: '访问日志表',
    indexes: [
      {
        fields: ['ip_address']
      },
      {
        fields: ['path']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['ip_address', 'path', 'created_at']
      }
    ]
  }
);

module.exports = {
  AccessLog
};
