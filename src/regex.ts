export function matches(
  regexp: RegExp,
  input: string,
  selector: ((a: RegExpExecArray) => string) | number
): string[] {
  const results = []
  let match = regexp.exec(input)
  while (match) {
    const value = typeof selector === 'number' ? match[selector] : selector(match)
    if (!!value) {
      results.push(value)
    }
    match = regexp.exec(input)
  }
  return results
}
