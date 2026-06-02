import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  internshipId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Application;
