import chalk from 'chalk';
import argv from './argv';

export enum LoggerLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
}

const LoggerLevelNum = {
  [LoggerLevel.error]: 2,
  [LoggerLevel.warn]: 1,
  [LoggerLevel.info]: 0,
  [LoggerLevel.debug]: -1,
};

class Logger {
  loggerLevel: LoggerLevel = LoggerLevel.info;
  timeCache: Record<string, number> = {};

  private readonly canLog = (level: LoggerLevel) => LoggerLevelNum[level] >= LoggerLevelNum[this.loggerLevel];

  isDebug = () => this.loggerLevel === LoggerLevel.debug;

  error = (...args: (string | Error)[]) => {
    if (this.canLog(LoggerLevel.error)) {
      console.error(
        chalk.bgRed(chalk.whiteBright(' Error ')),
        ...args.map(text => (typeof text === 'string' ? chalk.redBright(text) : text)),
      );
    }
  };

  warn = (...args: (string | Error)[]) => {
    if (this.canLog(LoggerLevel.warn)) {
      console.warn(chalk.bgYellow(chalk.yellowBright(' Warn ')), ...args.map(text => chalk.yellowBright(text)));
    }
  };

  success = (...args: (string | Error)[]) => {
    if (this.canLog(LoggerLevel.info)) {
      console.log(chalk.bgGreen(chalk.whiteBright(' Success ')), ...args.map(text => chalk.greenBright(text)));
    }
  };

  info = (...args: (string | Error)[]) => {
    if (this.canLog(LoggerLevel.info)) {
      console.log(chalk.bgCyan(chalk.cyanBright(' Info ')), ...args);
    }
  };

  mutable = (...args: (string | Error)[]) => {
    if (!argv.mute && this.canLog(LoggerLevel.info)) {
      console.log(chalk.bgCyan(chalk.cyanBright(' Info ')), ...args);
    }
  };

  debug = (...args: (string | Error)[]) => {
    if (this.canLog(LoggerLevel.debug)) {
      console.log(
        chalk.bgGray(chalk.whiteBright(' Debug ')),
        ...args.map(text => (typeof text === 'string' ? chalk.gray(text) : text)),
      );
    }
  };

  debugTime = (name = 'time', reset = false) => {
    const now = Date.now();
    if (this.canLog(LoggerLevel.debug)) {
      if (this.timeCache[name]) console.log(chalk.bgGray(chalk.whiteBright(` Time[${name}] `), `${now - this.timeCache[name]}ms`));
    }
    if (reset || !this.timeCache[name]) this.timeCache[name] = now;
  };
}

const logger = new Logger();

export default logger;
