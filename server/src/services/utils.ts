import pino from 'pino';

export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  const randomValue = Math.random() * (max - min) + min;
  return Number(randomValue.toFixed(decimals));
}

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}


const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  // On utilise pino-pretty uniquement en développement
  transport: isProduction 
    ? undefined 
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});