import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  internshipId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  maxPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  }
}, {
  timestamps: true,
});

export default Task;
