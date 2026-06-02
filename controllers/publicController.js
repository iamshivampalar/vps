import { Internship, Certificate, Student, User, ContactMessage, CmsPage, Setting } from '../models/index.js';
import { Op } from 'sequelize';

// Render Home Page
export async function getHome(req, res) {
  try {
    const internshipsCount = await Internship.count({ where: { status: 'active' } });
    const certificatesCount = await Certificate.count({ where: { verificationStatus: 'Active' } });
    const studentsCount = await Student.count();

    // Fetch active featured internship listings (limit 3)
    const featuredInternships = await Internship.findAll({
      where: { status: 'active' },
      limit: 3,
      order: [['createdAt', 'DESC']]
    });

    // Load any site settings for public branding
    const siteName = (await Setting.findByPk('SITE_NAME'))?.value || 'InternSpace';
    const siteDescription = (await Setting.findByPk('SITE_DESCRIPTION'))?.value || 'Next-Gen Educational Internship Portal';

    // Retrieve home sections from CMS
    let homeCms = await CmsPage.findByPk('home');
    let cmsData = {};
    if (homeCms) {
      cmsData = JSON.parse(homeCms.content);
    }

    return res.render('public/home', {
      title: 'Premium Internship & Fellowship Network',
      featuredInternships,
      stats: { internshipsCount, certificatesCount, studentsCount },
      siteName,
      siteDescription,
      cmsData
    });
  } catch (error) {
    console.error('Home Page render error:', error);
    return res.status(500).render('error', { title: 'Internal Server Error', message: error.message });
  }
}

// Render About Page
export async function getAbout(req, res) {
  try {
    const aboutCms = await CmsPage.findByPk('about');
    let cmsData = aboutCms ? JSON.parse(aboutCms.content) : {};

    return res.render('public/about', {
      title: 'Our Mission & Academic Enterprise Impact',
      cmsData
    });
  } catch (error) {
    console.error('About Page render error:', error);
    return res.status(500).render('error', { title: 'Server Error', message: error.message });
  }
}

// Render Programs List with Search & Categories
export async function getPrograms(req, res) {
  const { search, category, url_redirect } = req.query;

  try {
    const whereClause = { status: 'active' };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { skills: { [Op.like]: `%${search}%` } }
      ];
    }

    const programs = await Internship.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Fetch unique categories for sidebar filters
    const categoriesRows = await Internship.findAll({
      attributes: ['category'],
      group: ['category']
    });
    const categories = categoriesRows.map(r => r.category);

    return res.render('public/programs', {
      title: 'Available Internships & Fellowships',
      programs,
      categories,
      selectedCategory: category || '',
      searchKeyword: search || ''
    });
  } catch (error) {
    console.error('Programs render error:', error);
    return res.status(500).render('error', { title: 'Server Error', message: error.message });
  }
}

// View Program Details
export async function getProgramDetails(req, res) {
  const { id } = req.params;

  try {
    const program = await Internship.findByPk(id);
    if (!program) {
      return res.status(404).render('error', { title: 'Not Found', message: 'The requested internship program was not found.' });
    }

    return res.render('public/program-details', {
      title: program.title,
      program
    });
  } catch (error) {
    console.error('Program details error:', error);
    return res.status(500).render('error', { title: 'Server Error', message: error.message });
  }
}

// Contact support GET and POST
export async function getContact(req, res) {
  return res.render('public/contact', { title: 'Connect With Our Officers' });
}

export async function postContact(req, res) {
  const { name, email, subject, message } = req.body;

  try {
    await ContactMessage.create({ name, email, subject, message });
    return res.status(200).json({ success: true, message: 'Message received. A coordinator will email you shortly!' });
  } catch (error) {
    console.error('Contact submit error:', error);
    return res.status(500).json({ error: 'Failed to record entry support ticket.' });
  }
}

// Public Certificate Verification Gate
export async function getVerifyCertificate(req, res) {
  const { id } = req.query; // id will represent standard unique certificate key
  let certificate = null;

  try {
    if (id) {
      certificate = await Certificate.findOne({
        where: { certificateNumber: id },
        include: [
          {
            model: Student,
            as: 'student',
            include: [{ model: User, as: 'user' }, { model: College, as: 'college' }]
          },
          { model: Internship, as: 'internship' }
        ]
      });
    }

    return res.render('public/verify', {
      title: 'Digital Credential Registry System',
      certificate,
      searchedId: id || ''
    });
  } catch (error) {
    console.error('Verification portal error:', error);
    return res.status(500).render('error', { title: 'Credential Error', message: error.message });
  }
}

// Render dynamic legal screens
export async function getPrivacy(req, res) {
  const page = await CmsPage.findByPk('privacy');
  const details = page ? page.content : 'Custom corporate policies updated shortly.';
  return res.render('public/cms-page', { title: 'Privacy Guarantee Policies', pageTitle: 'Privacy Policy', details });
}

export async function getTerms(req, res) {
  const page = await CmsPage.findByPk('terms');
  const details = page ? page.content : 'Our standard platform participation usage terms.';
  return res.render('public/cms-page', { title: 'Terms of Platform Service', pageTitle: 'Terms of Use', details });
}

export async function getFaq(req, res) {
  const page = await CmsPage.findByPk('faq');
  const items = page ? JSON.parse(page.content) : [];
  return res.render('public/faq', { title: 'Frequently Asked Knowledge', items });
}
