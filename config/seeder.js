import bcrypt from 'bcryptjs';
import { User, College, Setting, CmsPage, Internship } from '../models/index.js';

export async function runSeeder() {
  console.log('[Database Seeder] Checking if database seeding is required...');

  try {
    // 1. Seed Site Settings
    const defaultSettings = [
      { key: 'SITE_NAME', value: 'InternSpace Elite' },
      { key: 'SITE_DESCRIPTION', value: 'The leading premium student fellowship, workspace tracker, and instant credentialing registry.' },
      { key: 'SMTP_HOST', value: '' },
      { key: 'SMTP_PORT', value: '587' },
      { key: 'SMTP_USER', value: '' },
      { key: 'SMTP_PASS', value: '' },
      { key: 'MAINTENANCE_MODE', value: 'false' },
    ];

    for (const s of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: s.key },
        defaults: { value: s.value }
      });
    }

    // 2. Seed Default Admin User
    const adminEmail = 'admin@internspace.org';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      // Create Admin
      await User.create({
        name: 'Executive Director',
        email: adminEmail,
        password: 'Admin@2026', // Bcrypt hook handles encryption on User
        role: 'Super Admin',
        mobile: '+1-555-0199',
        isEmailVerified: true,
        status: 'active'
      });
      console.log('[Database Seeder] Super Admin created: admin@internspace.org | Admin@2026');
    }

    // 3. Seed College Representatives baseline
    const repEmail = 'rep@princeton.edu';
    const existingRep = await User.findOne({ where: { email: repEmail } });
    if (!existingRep) {
       await User.create({
         name: 'Dean Arthur Pendelton',
         email: repEmail,
         password: 'Rep@2026',
         role: 'College Representative',
         mobile: '+1-555-0177',
         isEmailVerified: true,
         status: 'active'
       });
       console.log('[Database Seeder] Representative account created: rep@princeton.edu | Rep@2026');
    }

    // 4. Seed Partners (verified Colleges)
    const seedColleges = [
      { name: 'Princeton University Academic Center', code: 'PRN-01', domain: 'princeton.edu', city: 'Princeton', state: 'New Jersey', isVerified: true },
      { name: 'Stanford Engineering Institute', code: 'STN-02', domain: 'stanford.edu', city: 'Stanford', state: 'California', isVerified: true },
      { name: 'MIT Computer Science Department', code: 'MIT-03', domain: 'mit.edu', city: 'Cambridge', state: 'Massachusetts', isVerified: true },
    ];

    for (const clg of seedColleges) {
      const dbClg = await College.findOne({ where: { code: clg.code } });
      if (!dbClg) {
        // Find rep user to link
        const rep = await User.findOne({ where: { email: repEmail } });
        await College.create({
          ...clg,
          representativeUserId: rep?.id || null
        });
        console.log(`[Database Seeder] Partner college created: ${clg.name}`);
      }
    }

    // 5. Seed Static CMS Content
    // Home layout setup
    const homeSections = {
      heroTitle: 'Accelerating Technical Internships Globally',
      heroSubtitle: 'Work on live commercial, non-profit, or research initiatives under direct supervision. Earn corporate-ready credentials valid anywhere.',
      ctaText: 'Explore Fellowships',
      features: [
        { title: 'Interactive Homework Tracks', desc: 'Syllabus and milestones published dynamically. Submit assets, upload files, and receive revision-by-revision grading.' },
        { title: 'Verifiable Credentials', desc: 'Secure unique hash certificates containing cryptographically sealed completion metrics, signature blocks, and QR validation tags.' },
        { title: 'Unified Partner Auditing', desc: 'University representatives can access candidate dossiers, inspect homework portfolios, and audit educational metrics directly.' },
      ],
      testimonials: [
        { author: 'Clara Oswald', role: 'Software Engineer at Linear', txt: 'The unified submission system and instant credential verification allowed me to validate my workspace competencies and land a role within weeks of completion!' },
        { author: 'Marcus Brody', role: 'PhD Scholar at Stanford', txt: 'As an organization oversight committee, reviewing candidate task work, providing feedback revisions, and issuing digital PDF certificates is incredibly seamless of this platform.' },
      ]
    };

    await CmsPage.findOrCreate({
      where: { slug: 'home' },
      defaults: {
        title: 'Home Settings configuration',
        content: JSON.stringify(homeSections)
      }
    });

    // FAQ sections
    const faqData = [
      { q: 'Who can apply to InternSpace fellowship tracks?', a: 'Any fully enrolled graduate or post-graduate candidate matching the specified internship eligibility requirements set by administrative departments.' },
      { q: 'Are certificates cryptographically secure?', a: 'Yes. Each certificate includes digital signatures matching individual records in the distributed verification register database, searchable and verifiable instantly via built-in URL routing and QR scan triggers.' },
      { q: 'How does the student referral scheme function?', a: 'Upon registration, fellows receive a unique link. When fellow candidates sign up using that code, clicks and registered metric points accrue onto dashboards dynamically!' },
    ];

    await CmsPage.findOrCreate({
      where: { slug: 'faq' },
      defaults: {
        title: 'FAQ Configuration',
        content: JSON.stringify(faqData)
      }
    });

    // Privacy template
    await CmsPage.findOrCreate({
      where: { slug: 'privacy' },
      defaults: {
        title: 'Privacy Policy',
        content: 'Protecting candidate data records is our primary priority mandate. We implement secure JWT authentication cookies, hashed password parameters, XSS protection filters, and TLS cryptographic routing overlays. No candidate portfolio data or personal details are distributed or mapped to secondary tracking services without explicit written consent.'
      }
    });

    // Terms template
    await CmsPage.findOrCreate({
      where: { slug: 'terms' },
      defaults: {
        title: 'Terms of Platform Use',
        content: 'By participating in fellowship tracks on this system, candidates agree strictly to uphold scholastic safety principles. Submitted homework task files must represent original academic output. Plagiarism check filters and session IP monitoring registries protect administrative credentials. Academic committees maintain executive rights to suspend accounts matching violations.'
      }
    });

    // About template
    const aboutData = {
      mission: 'Uphold premium standards in industrial education tracking through scalable, user-centric administrative software. No placeholders: pure production workspace reporting.',
      vision: 'Bridging technical academic learning centers and corporate operations by publishing transparent, auditable portfolio records.',
      team: [
        { name: 'Dr. Evelyn Brand', role: 'Chief of Academic Fellowships', desc: 'PhD in Informatics with 15+ years overseeing university research cooperatives.' },
        { name: 'David Lightman', role: 'Director of Technology Solutions', desc: 'Former enterprise systems architect scaling custom database infrastructure.' }
      ]
    };

    await CmsPage.findOrCreate({
      where: { slug: 'about' },
      defaults: {
        title: 'About Team & Mission Profile',
        content: JSON.stringify(aboutData)
      }
    });

    // 6. Seed an initial Internship track so the listings page has immediate content
    const initialTrack = {
      title: 'Global Climate NGO Operations Research Fellowship',
      description: 'Collaborate with environmental officers to research climate metrics, organize digital campaigns, and draft corporate carbon reporting guidelines. Ideal for candidates passionate about public policy and data analytics.',
      category: 'NGO Support & Governance',
      duration: '12 Weeks',
      eligibility: 'Master or Bachelor candidates in Environmental Studies, Public Admin, or Data Science',
      skills: 'Data reporting, Technical Writing, Carbon audits, NGO outreach',
      seats: 25,
      certificateAvailable: true,
      status: 'active'
    };

    await Internship.findOrCreate({
      where: { title: initialTrack.title },
      defaults: initialTrack
    });

    console.log('[Database Seeder] Seeding tasks completed successfully.');
  } catch (error) {
    console.error('[Database Seeder] Failure running tables seeder:', error);
  }
}
