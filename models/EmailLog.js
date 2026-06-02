import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  toEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Success', 'Failed'),
    defaultValue: 'Success',
  },
  errorDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  updatedAt: false,
});

export default EmailLog;
