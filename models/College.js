import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const College = sequelize.define('College', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  representativeUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default College;
