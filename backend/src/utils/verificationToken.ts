import crypto from "crypto";

export const generateVerificationToken = () =>
  crypto.randomInt(100000, 999999).toString();

//time in seconds, i.e. 300 for 5 mins
export const generateExpiryTime = (time: number) =>
  new Date(Date.now() + time * 1000);
