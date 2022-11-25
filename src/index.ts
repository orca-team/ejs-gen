import ejs from 'ejs';
import { promises as fs } from 'fs';
import _glob from 'glob';
import { dirname, isAbsolute, join } from 'path';
import { promisify } from 'util';
import {
  camelCase,
  pascalCase,
  paramCase,
  noCase,
  dotCase,
  capitalCase,
  pathCase,
  snakeCase,
  headerCase,
  sentenceCase,
  constantCase,
} from 'change-case';
import logger from './logger';

const glob = promisify(_glob);
const cwd = process.cwd();

export type TransformEjsDirOptions = {
  data?: Record<string, unknown>;
  ejsOnly?: string | boolean;
};

export default async function transformEjsDir(source: string, target: string, options: TransformEjsDirOptions = {}) {
  const { data = {}, ejsOnly } = options;
  const sourcePath = isAbsolute(source) ? source : join(cwd, source);
  logger.debug('sourcePath:', sourcePath);
  const fileList = await glob('**', {
    cwd: sourcePath,
  });

  await Promise.all(
    fileList.map(async (filePath) => {
      const fullPath = join(sourcePath, filePath);
      try {
        const stat = await fs.stat(fullPath);
        const targetDir = isAbsolute(target) ? target : join(cwd, target);
        let targetPath = filePath;
        // transform targetPath
        targetPath = ejs.render(
          targetPath,
          {
            ...data,
            camelCase,
            pascalCase,
            paramCase,
            noCase,
            dotCase,
            capitalCase,
            pathCase,
            snakeCase,
            headerCase,
            sentenceCase,
            constantCase,
          },
          {
            openDelimiter: '[',
            closeDelimiter: ']',
          },
        );

        if (stat.isDirectory()) {
          const targetFullPath = join(targetDir, targetPath);
          await fs.mkdir(targetFullPath, { recursive: true });
        } else if (stat.isFile()) {
          // read
          const file = await fs.readFile(fullPath);
          let fileContent = file.toString();

          let shouldTransform = true;
          if (ejsOnly) {
            let ejsSuffix = typeof ejsOnly === 'string' ? ejsOnly : '.ejs';
            if (!ejsSuffix.startsWith('.')) ejsSuffix = `.${ejsSuffix}`;
            if (targetPath.endsWith(ejsSuffix)) {
              targetPath = targetPath.slice(0, targetPath.length - ejsSuffix.length);
            } else {
              // do not transform
              shouldTransform = false;
            }
          }

          if (shouldTransform) {
            fileContent = ejs.render(fileContent, {
              ...data,
              camelCase,
              pascalCase,
              paramCase,
              noCase,
              dotCase,
              capitalCase,
              pathCase,
              snakeCase,
              headerCase,
              sentenceCase,
              constantCase,
            });
          }

          // write
          const targetFullPath = join(targetDir, targetPath);
          await fs.mkdir(dirname(targetFullPath), { recursive: true });
          await fs.writeFile(targetFullPath, fileContent);
        } else {
          logger.warn(`Path [${fullPath}] ignored is not a file or directory.`)
        }
      } catch (error: any) {
        logger.error('Error while transforming file:', fullPath);
        logger.error(error);
      }
    }),
  );
}
