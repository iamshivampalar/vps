import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  submissionText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachments: {
    type: DataTypes.STRING, // File path of pdf, doc, png, jpg
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Revision Requested'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Submission;
