import { User, Student, College, Internship, Application, Task, Submission, Certificate, Referral, Notification, ActivityLog } from '../models/index.js';
import path from 'path';

// Get Student Dashboard
export async function getDashboard(req, res) {
  try {
    const student = req.user.student;
    if (!student) {
      return res.redirect('/auth/login?error=Student profile not found.');
    }

    // 1. Fetch Student applications
    const applications = await Application.findAll({
      where: { studentId: student.id },
      include: [{ model: Internship, as: 'internship' }]
    });

    const activeApplication = applications.find(app => app.status === 'Approved');
    const hasCompletedOption = applications.find(app => app.status === 'Completed');

    // 2. Fetch Tasks & Submissions if accepted
    let tasks = [];
    let submissionsCount = 0;
    let averageGrade = 0;

    if (activeApplication) {
      // Find tasks assigned to this internship
      tasks = await Task.findAll({
        where: { internshipId: activeApplication.internshipId },
        order: [['dueDate', 'ASC']]
      });

      // Find submissions for this student
      const submissions = await Submission.findAll({
        where: { studentId: student.id },
        include: [{ model: Task, as: 'task' }]
      });
      submissionsCount = submissions.length;

      // Calculate performance average grade
      const gradedSubmissions = submissions.filter(sub => sub.status === 'Approved' && sub.grade !== null);
      if (gradedSubmissions.length > 0) {
        const sum = gradedSubmissions.reduce((acc, curr) => acc + curr.grade, 0);
        averageGrade = Math.round(sum / gradedSubmissions.length);
      }

      // Map tasks to include student's current submission status
      tasks = tasks.map(task => {
        const submission = submissions.find(sub => sub.taskId === task.id);
        return {
          ...task.toJSON(),
          submission: submission ? submission.toJSON() : null
        };
      });
    }

    // 3. Referral Statistics
    const referralList = await Referral.findAll({
      where: { referrerStudentId: student.id }
    });
    const referralClicks = student.referralClicks;
    const referralRegistrations = referralList.filter(r => r.status === 'Registered').length;
    const referralConversions = referralList.filter(r => r.status === 'Converted').length;

    // 4. Certificate issued
    const certificate = await Certificate.findOne({
      where: { studentId: student.id, verificationStatus: 'Active' },
      include: [{ model: Internship, as: 'internship' }]
    });

    // 5. Unread in-app alerts
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    return res.render('student/dashboard', {
      title: 'Candidate Learning Dashboard',
      student,
      applications,
      activeApplication,
      hasCompletedOption,
      tasks,
      submissionsCount,
      averageGrade,
      referrals: { referralClicks, referralRegistrations, referralConversions },
      certificate,
      notifications
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).render('error', { title: 'Dashboard Error', message: error.message });
  }
}

// Apply for Internship Page / Post Action
export async function postApply(req, res) {
  const { internshipId } = req.body;
  const student = req.user.student;

  try {
    // Check if outstanding applications exit
    const existing = await Application.findOne({
      where: { studentId: student.id, internshipId }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already applied to this program.' });
    }

    const internship = await Internship.findByPk(internshipId);
    if (!internship || internship.status !== 'active') {
      return res.status(404).json({ error: 'This internship program is currently unavailable.' });
    }

    // Review total seats
    const currentApplications = await Application.count({
      where: { internshipId, status: 'Approved' }
    });
    if (currentApplications >= internship.seats) {
       return res.status(400).json({ error: 'Sorry, this program is currently fully occupied!' });
    }

    // Build application record
    await Application.create({
      studentId: student.id,
      internshipId,
      status: 'Pending'
    });

    // Build notifications for Admin/Security and student
    await Notification.create({
      userId: req.user.id,
      title: 'Application Received',
      message: `Your reservation request for ${internship.title} is now under review.`,
      type: 'info'
    });

    return res.status(200).json({ success: true, message: 'Application submitted successfully.' });
  } catch (error) {
    console.error('Apply internship error:', error);
    return res.status(500).json({ error: 'Applying for this internship failed.' });
  }
}

// Edit Profile & Upload Resume / Avatar
export async function getProfile(req, res) {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: [{ model: College, as: 'college' }]
    });

    const colleges = await College.findAll({ where: { isVerified: true } });

    return res.render('student/profile', {
      title: 'Build Credentials Profile',
      student,
      colleges
    });
  } catch (error) {
     return res.status(500).render('error', { title: 'Server Error', message: error.message });
  }
}

export async function postUpdateProfile(req, res) {
  const { name, mobile, collegeId, degree, semester, skills } = req.body;
  const student = req.user.student;

  try {
    // Update User parameters
    req.user.name = name;
    req.user.mobile = mobile;
    if (req.files && req.files.avatar) {
      req.user.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
    }
    await req.user.save();

    // Update Student detailed parameters
    student.collegeId = collegeId || null;
    student.degree = degree;
    student.semester = semester;
    student.skills = skills;
    if (req.files && req.files.resume) {
      student.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
    }
    await student.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'Profile Updated',
      details: 'User updated general profile information and uploaded files.',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.redirect('/student/profile?success=Your profile has been saved.');
  } catch (error) {
    console.error('Update profile error:', error);
    return res.redirect('/student/profile?error=' + encodeURIComponent(error.message));
  }
}

// Get Task Submission detailed page
export async function getTaskSubmission(req, res) {
  const { taskId } = req.params;
  const student = req.user.student;

  try {
    const task = await Task.findByPk(taskId, {
      include: [{ model: Internship, as: 'internship' }]
    });
    if (!task) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Task details not found.' });
    }

    const submission = await Submission.findOne({
      where: { taskId, studentId: student.id }
    });

    return res.render('student/task-submit', {
      title: `Submit Workflow: ${task.title}`,
      task,
      submission
    });
  } catch (error) {
    console.error('Task submission details page error:', error);
    return res.status(500).render('error', { title: 'Server Error', message: error.message });
  }
}

// Submit Task Assignment (Post File & Notes)
export async function postSubmitTask(req, res) {
  const { taskId, submissionText } = req.body;
  const student = req.user.student;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Requested assignment task not found.' });
    }

    // Handle Upload attachment path
    let attachments = null;
    if (req.file) {
      attachments = `/uploads/submissions/${req.file.filename}`;
    }

    // Check if updating an existing submission
    let submission = await Submission.findOne({
      where: { taskId, studentId: student.id }
    });

    if (submission) {
      // Re-upload updates
      submission.submissionText = submissionText || submission.submissionText;
      if (attachments) {
        submission.attachments = attachments;
      }
      submission.status = 'Pending'; // Change status back to Pending review!
      await submission.save();
    } else {
      submission = await Submission.create({
        taskId,
        studentId: student.id,
        submissionText,
        attachments,
        status: 'Pending'
      });
    }

    await Notification.create({
      userId: req.user.id,
      title: 'Assignment Submitted',
      message: `Your submission for task '${task.title}' was received and awaits audit review.`,
      type: 'success'
    });

    return res.status(200).json({ success: true, message: 'Your task has been submitted successfully.' });
  } catch (error) {
    console.error('Submit task processing error:', error);
    return res.status(500).json({ error: 'Submit workflow experienced a backend failure.' });
  }
}

// Track In-App Notification Archivals
export async function postDismissNotification(req, res) {
  const { id } = req.params;
  try {
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id }
    });
    if (notification) {
      notification.status = 'read';
      await notification.save();
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
