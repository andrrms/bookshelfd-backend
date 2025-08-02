import pc from 'picocolors';
import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import config from '@/config';

export type LogLevel = 'verbose' | 'info' | 'error';

export default class Logger {
  private static logFolder = join(__dirname, '../logs');

  /**
   * Formata a data e hora atual ou a data fornecida em uma string legível.
   * @param date Data a ser formatada. Se não for fornecida, usa a data atual.
   * @returns String formatada representando a data e hora.
   */
  private static dateString(
    date?: Date | string,
    withDate: boolean = true,
  ): string {
    let targetDate: Date;

    if (date) {
      if (typeof date === 'string') {
        targetDate = new Date(date);
      } else {
        targetDate = date;
      }
    } else {
      targetDate = new Date();
    }

    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const seconds = String(targetDate.getSeconds()).padStart(2, '0');

    if (!withDate) {
      return `${hours}:${minutes}:${seconds}`;
    }

    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private static writeToFile(message: string, file: LogLevel): void {
    const logFilePath = join(Logger.logFolder, `${file}.log`);
    const logMessage = `${Logger.dateString()} - ${message}\n`;

    if (!existsSync(Logger.logFolder)) {
      mkdirSync(Logger.logFolder, { recursive: true });
    }

    appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error(`[LOGGER] Erro ao escrever no arquivo de log: ${err}`);
      }
    });
  }

  private static canLog(level: LogLevel): boolean {
    switch (config.log_level) {
      case 'verbose':
        return true; // Log all levels
      case 'info':
        return ['info', 'error'].includes(level); // Log info and error levels
      case 'error':
        return level === 'error'; // Log only error level
      default:
        return false; // Do not log other levels
    }
  }

  static verbose(message: string): void {
    Logger.writeToFile(message, 'verbose');
    if (Logger.canLog('verbose'))
      console.log(
        `${pc.cyan('[VERBOSE]')} ${pc.blue(Logger.dateString(undefined, false))} - ${message}`,
      );
  }

  static info(message: string): void {
    Logger.writeToFile(message, 'info');
    Logger.writeToFile(message, 'verbose');
    if (Logger.canLog('info'))
      console.log(
        `${pc.green('[LOG]')} ${pc.blue(Logger.dateString(undefined, false))} - ${message}`,
      );
  }

  static error(message: string): void {
    Logger.writeToFile(message, 'error');
    if (Logger.canLog('error'))
      console.error(
        `${pc.red('[ERROR]')} ${pc.blue(Logger.dateString(undefined, false))} - ${message}`,
      );
  }
}
