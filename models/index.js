import sequelize from '../config/db.js';
import User from './User.js';
import College from './College.js';
import Student from './Student.js';
import Internship from './Internship.js';
import Application from './Application.js';
import Task from './Task.js';
import Submission from './Submission.js';
import Certificate from './Certificate.js';
import Referral from './Referral.js';
import Notification from './Notification.js';
import ActivityLog from './ActivityLog.js';
import Setting from './Setting.js';
import CmsPage from './CmsPage.js';
import ContactMessage from './ContactMessage.js';
import EmailLog from './EmailLog.js';

// Relations
User.hasOne(Student, { foreignKey: 'userId', as: 'student', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

College.hasMany(Student, { foreignKey: 'collegeId', as: 'students', onDelete: 'SET NULL' });
Student.belongsTo(College, { foreignKey: 'collegeId', as: 'college' });

College.belongsTo(User, { foreignKey: 'representativeUserId', as: 'representative', onDelete: 'SET NULL' });
User.hasOne(College, { foreignKey: 'representativeUserId', as: 'managedCollege' });

Student.hasMany(Application, { foreignKey: 'studentId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Internship.hasMany(Application, { foreignKey: 'internshipId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Internship, { foreignKey: 'internshipId', as: 'internship' });

Internship.hasMany(Task, { foreignKey: 'internshipId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Internship, { foreignKey: 'internshipId', as: 'internship' });

Task.hasMany(Submission, { foreignKey: 'taskId', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

Student.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions', onDelete: 'CASCADE' });
Submission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(Certificate, { foreignKey: 'studentId', as: 'certificates', onDelete: 'CASCADE' });
Certificate.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Internship.hasMany(Certificate, { foreignKey: 'internshipId', as: 'certificates', onDelete: 'CASCADE' });
Certificate.belongsTo(Internship, { foreignKey: 'internshipId', as: 'internship' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Student.hasMany(Referral, { foreignKey: 'referrerStudentId', as: 'referralList', onDelete: 'CASCADE' });
Referral.belongsTo(Student, { foreignKey: 'referrerStudentId', as: 'referrer' });

export {
  sequelize,
  User,
  College,
  Student,
  Internship,
  Application,
  Task,
  Submission,
  Certificate,
  Referral,
  Notification,
  ActivityLog,
  Setting,
  CmsPage,
  ContactMessage,
  EmailLog,
};
