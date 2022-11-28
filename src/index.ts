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
  suffix?: string[];
  ejsOnly?: string | boolean;
};

const defaultSuffix = ['.txt', '.js', '.jsx', '.ts', '.tsx', '.json', '.ini', '.ejs'];

export default async function transformEjsDir(source: string, target: string, options: TransformEjsDirOptions = {}) {
  const { data = {}, suffix = [], ejsOnly } = options;
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
          // 判断后缀，是否支持的文件
          let shouldTransform = true;

          if (ejsOnly) {
            let ejsSuffix = typeof ejsOnly === 'string' ? ejsOnly : '.ejs';
            if (!ejsSuffix.startsWith('.')) ejsSuffix = `.${ejsSuffix}`;
            shouldTransform = filePath.endsWith(ejsSuffix);
            // ejsOnly mode 移除 ejs 后缀
            if (targetPath.endsWith(ejsSuffix)) {
              targetPath = targetPath.slice(0, targetPath.length - ejsSuffix.length);
            }
          } else {
            shouldTransform = [...suffix, ...defaultSuffix].some((_suffix) => {
              const s = _suffix.startsWith('.') ? _suffix : `.${_suffix}`;
              return filePath.endsWith(s);
            });
          }

          if (!shouldTransform) {
            // 不需要进行字符串转换的文件，使用 copy 模式
            const targetFullPath = join(targetDir, targetPath);
            await fs.copyFile(fullPath, targetFullPath);
            return;
          }

          // read
          const file = await fs.readFile(fullPath);
          let fileContent = file.toString();

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

          // write
          const targetFullPath = join(targetDir, targetPath);
          await fs.mkdir(dirname(targetFullPath), { recursive: true });
          await fs.writeFile(targetFullPath, fileContent);
        } else {
          logger.warn(`Path [${fullPath}] ignored is not a file or directory.`);
        }
      } catch (error: any) {
        logger.error('Error while transforming file:', fullPath);
        logger.error(error);
      }
    }),
  );
}
