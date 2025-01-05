export function sbReplace(input: string, start: number, end: number, str: string): string {
  if (start < 0 || end < 0 || start > input.length || end > input.length || start > end) {
    throw new RangeError("Invalid start or end indices.");
  }

  // Replace the substring from start to end with `str`
  return input.slice(0, start) + str + input.slice(end);
}

export function integerValueOf(input: string | null): number {
  if (input === null) {
    return NaN;
  } else {
    return +input;
  }
}
