import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., "info", "task", "application", "certificate", "success", "error"
    defaultValue: 'info',
  },
  status: {
    type: DataTypes.ENUM('unread', 'read', 'archived'),
    defaultValue: 'unread',
  }
}, {
  timestamps: true,
});

export default Notification;
