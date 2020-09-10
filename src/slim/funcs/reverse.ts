function reverse(input: string): string;
function reverse<T>(input: T[]): T[];
function reverse(input: any): any {
  return typeof input === 'string'
    ? (input.split('').reverse().join('') as any)
    : Array.prototype.slice.call(input, 0).reverse();
}
