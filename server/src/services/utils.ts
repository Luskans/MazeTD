export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  const randomValue = Math.random() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(randomValue * factor) / factor;
}