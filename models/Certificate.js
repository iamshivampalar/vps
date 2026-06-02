import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Certificate = sequelize.define('Certificate', {
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
  certificateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qrPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verificationStatus: {
    type: DataTypes.ENUM('Active', 'Revoked'),
    defaultValue: 'Active',
  },
  digitalSignature: {
    type: DataTypes.STRING,
    defaultValue: 'AUTHORIZED_DIGITAL_SIGNATURE_INTERNSPACE',
  }
}, {
  timestamps: true,
});

export default Certificate;
