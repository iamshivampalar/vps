import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CmsPage = sequelize.define('CmsPage', {
  slug: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT, // stores serialized JSON configs or markdown/HTML string structures
    allowNull: false,
  }
}, {
  timestamps: true,
});

export default CmsPage;
