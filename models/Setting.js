import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Setting;
