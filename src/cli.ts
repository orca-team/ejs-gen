import { program } from 'commander';
import JSON5 from 'json5';
import transformEjsDir from './index';
import pkg from '../package.json';
import argv from './argv';
import logger, { LoggerLevel } from './logger';

const cwd = process.cwd();

if (argv['verbose']) {
  logger.loggerLevel = LoggerLevel.debug;
}

logger.debug('cwd:', cwd);

program.name('cbd');

program.version(pkg.version, '-v, --version');

program
  .argument('<source>', '模板目录')
  .argument('<target>', '目标目录')
  .description('将模板目录下的文件复制到目标目录，对所有的文件都会进行 ejs 模板替换')
  .option('--data <data>', '需要进行模板替换的内容(JSON格式)')
  .option('--ejs-only [suffix]', '仅对后缀为 ejs 的文件进行模板内容替换')
  .option('--verbose')
  .action(async (source, target, options) => {
    const { data = '{}' } = options;
    await transformEjsDir(source, target, { ...options, data: JSON5.parse(data) });
  });

program.parseAsync().finally(async () => {});
