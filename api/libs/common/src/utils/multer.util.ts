import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import * as fs from 'node:fs';

interface MulterUploadOptionsConfig {
  prefix?: string;
  destination?: string;
  maxSizeInMb?: number;
}

const multerUploadOptions = (config?: MulterUploadOptionsConfig | string) => {
  const prefix =
    typeof config === 'string' ? config : (config?.prefix ?? 'event');
  const destination =
    typeof config === 'object' && config?.destination
      ? config.destination
      : 'uploads';
  const maxSizeInMb =
    typeof config === 'object' && config?.maxSizeInMb ? config.maxSizeInMb : 5;

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const uploadDir = join(process.cwd(), destination);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname) || '.jpg';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: maxSizeInMb * 1024 * 1024,
    },
  };
};

export function uploadInterceptor(
  fieldName = 'image',
  config?: MulterUploadOptionsConfig | string,
) {
  return FileInterceptor(fieldName, multerUploadOptions(config));
}
