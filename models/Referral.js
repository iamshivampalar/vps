import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referrerStudentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  referredUserId: {
    type: DataTypes.UUID,
    allowNull: true, // starts null if it was just a click
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Click', 'Registered', 'Converted'), // Converted means they got an approved application!
    defaultValue: 'Click',
  }
}, {
  timestamps: true,
});

export default Referral;
