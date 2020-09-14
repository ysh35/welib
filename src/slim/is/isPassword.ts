import regexps from './regexps';

export default function isPassword(input: string) {
  return regexps.password.test(input);
}
