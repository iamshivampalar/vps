import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup directories
const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
const dirs = ['resumes', 'submissions', 'avatars'];

dirs.forEach(dir => {
  const dPath = path.join(baseUploadDir, dir);
  if (!fs.existsSync(dPath)) {
    fs.mkdirSync(dPath, { recursive: true });
  }
});

// Configure Custom Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'submissions';
    if (file.fieldname === 'resume') {
      subfolder = 'resumes';
    } else if (file.fieldname === 'avatar') {
      subfolder = 'avatars';
    }
    cb(null, path.join(baseUploadDir, subfolder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filter File Mimetypes
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Validation Error: File extension ${ext} not allowed. Please upload PDF, DOC, DOCX, PNG, or JPG only.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default upload;
