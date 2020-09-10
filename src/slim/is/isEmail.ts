import regexps from './regexps';

export default function isEmail(input: string) {
  return regexps.email.test(input);
}
