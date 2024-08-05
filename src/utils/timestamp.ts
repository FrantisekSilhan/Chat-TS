const EPOCH = 1722893503219n; //2024-08-04T22:26:52.712Z
const TIMESTAMP_BITS = 46; // 2,231.378240032471 years
const SEQUENCE_BITS = 12; // 4,096.0
const ID_BITS = 26; // 67,108,864.0

let sequence = 0;

const getNextSequence = (): number => {
  sequence = (sequence + 1) % (1 << SEQUENCE_BITS);
  return sequence;
}

import type { ExecuteResult } from "./database";

export const timestamp = (id: ExecuteResult): string => {
  const timestamp = BigInt(Date.now()) - EPOCH;
  const sequence = BigInt(getNextSequence());

  const timestampShifted = timestamp << BigInt(ID_BITS + SEQUENCE_BITS);
  const sequenceShifted = sequence << BigInt(ID_BITS);
  const idShifted = BigInt(id);

  const snowflake = timestampShifted | sequenceShifted | idShifted;

  return snowflake.toString();
}

export const timestampToDate = (snowflakeString: string): [ExecuteResult, ExecuteResult, number] => {
  const snowflake = BigInt(snowflakeString);

  const timestampMask = (BigInt(1) << BigInt(TIMESTAMP_BITS)) - BigInt(1);
  const idMask = (BigInt(1) << BigInt(ID_BITS)) - BigInt(1);
  const sequenceMask = (BigInt(1) << BigInt(SEQUENCE_BITS)) - BigInt(1);

  const sequence = Number((snowflake >> BigInt(ID_BITS)) & sequenceMask);
  const timestamp = (snowflake >> BigInt(ID_BITS + SEQUENCE_BITS)) & timestampMask;
  const id = snowflake & idMask;

  const actualTimestamp = BigInt(timestamp) + EPOCH;

  return [actualTimestamp as unknown as ExecuteResult, id as ExecuteResult, sequence];
};

export default {
  timestamp,
  timestampToDate
}