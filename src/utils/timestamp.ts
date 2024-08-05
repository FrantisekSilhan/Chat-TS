const EPOCH = 1722810412712; //2024-08-04T22:26:52.712Z

export const timestamp = (): string => {
  return Math.floor((Date.now() - EPOCH) / 1000).toString();
}

export const timestampToDate = (timestamp: string): string => {
  return new Date(parseInt(timestamp) * 1000 + EPOCH).toISOString();
}

export default {
  timestamp,
  timestampToDate
}