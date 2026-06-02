import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  collegeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  semester: {
    type: DataTypes.STRING, // e.g. "5th" or "Semester 6"
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING, // uploaded CV path
    allowNull: true,
  },
  skills: {
    type: DataTypes.TEXT, // comma-separated strings or JSON stringified list
    allowNull: true,
    defaultValue: '',
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  referredByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  referralClicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

export default Student;
