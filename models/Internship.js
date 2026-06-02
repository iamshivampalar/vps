import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Internship = sequelize.define('Internship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING, // e.g., Web Development, Data Science, NGO outreach
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING, // e.g., "3 Months", "6 Weeks"
    allowNull: false,
  },
  eligibility: {
    type: DataTypes.STRING, // e.g., "Any Graduate", "CS Tech student"
    allowNull: false,
  },
  skills: {
    type: DataTypes.STRING, // e.g., "HTML, CSS, JS, Node"
    allowNull: false,
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  certificateAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'closed'),
    defaultValue: 'active',
  }
}, {
  timestamps: true,
});

export default Internship;
