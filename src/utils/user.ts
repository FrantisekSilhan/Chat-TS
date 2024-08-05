import shared from "../shared";

export const usernameRegex = (username: string): boolean => {
  const minLength = shared.config.length.username.min;
  const maxLength = shared.config.length.username.max;
  const regex = new RegExp(`^[\\w]{${minLength},${maxLength}}$`);
  return regex.test(username);
};

export const displaynameRegex = (displayname: string): boolean => {
  const minLength = shared.config.length.username.min;
  const maxLength = shared.config.length.username.max;
  const regex = new RegExp(`^[\\p{L}\\w\\s]{${minLength},${maxLength}}$`, "u");
  return regex.test(displayname);
};

export const passwordRegex = (password: string): boolean => {
  const minLength = shared.config.length.password.min;
  const maxLength = shared.config.length.password.max;
  const regex = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()-_+=]).{${minLength},${maxLength}}$`);
  return regex.test(password);
};

export const emailRegex = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getRandomHSL = (saturation: number, lightness: number): string => {
  let hue = Math.floor(Math.random() * 360);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}