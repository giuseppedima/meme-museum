import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { extname } from 'path';

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = extname(file.originalname).toLowerCase();

  if (/jpeg|jpg|png|gif/.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only extensions .jpg, .jpeg, .png, .gif are allowed.'));
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    },
  }),
  fileFilter,
});

export default upload;