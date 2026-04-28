const { Model, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

// 预约状态枚举
const RESERVATION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  EXPIRED: 'expired'
};

// 预约渠道枚举
const RESERVATION_CHANNEL = {
  ANDROID: 'android',
  IOS: 'ios',
  PC: 'pc'
};

class Reservation extends Model {
  // 检查手机号是否已经预约
  static async isPhoneReserved(phone) {
    const reservation = await this.findOne({
      where: { phone }
    });
    return !!reservation;
  }

  // 根据手机号获取预约信息
  static async getByPhone(phone) {
    return await this.findOne({
      where: { phone }
    });
  }

  // 检查 IP 是否在指定时间内预约次数过多
  static async checkIPLimit(ipAddress, limitMinutes = 60, maxCount = 5) {
    const timeAgo = new Date(Date.now() - limitMinutes * 60 * 1000);
    const count = await this.count({
      where: {
        ip_address: ipAddress,
        created_at: {
          [Op.gte]: timeAgo
        }
      }
    });
    return count >= maxCount;
  }

  // 创建预约记录
  static async createReservation(data) {
    return await this.create({
      phone: data.phone,
      channel: data.channel,
      status: RESERVATION_STATUS.PENDING,
      ip_address: data.ipAddress,
      user_agent: data.userAgent
    });
  }

  // 更新预约状态
  static async updateStatus(phone, status) {
    return await this.update(
      { status },
      { where: { phone } }
    );
  }
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      comment: '手机号'
    },
    channel: {
      type: DataTypes.ENUM(
        RESERVATION_CHANNEL.ANDROID,
        RESERVATION_CHANNEL.IOS,
        RESERVATION_CHANNEL.PC
      ),
      allowNull: false,
      comment: '预约渠道'
    },
    status: {
      type: DataTypes.ENUM(
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.SUCCESS,
        RESERVATION_STATUS.EXPIRED
      ),
      allowNull: false,
      defaultValue: RESERVATION_STATUS.PENDING,
      comment: '预约状态'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '预约时的 IP 地址'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '预约时的 User-Agent'
    }
  },
  {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    comment: '预约信息表',
    indexes: [
      {
        unique: true,
        fields: ['phone']
      },
      {
        fields: ['status']
      },
      {
        fields: ['ip_address']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

module.exports = {
  Reservation,
  RESERVATION_STATUS,
  RESERVATION_CHANNEL
};
