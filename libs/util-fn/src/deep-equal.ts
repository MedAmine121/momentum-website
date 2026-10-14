/**
 * Fast deep object comparison
 *
 * Taken from https://www.npmjs.com/package/fast-deep-equal
 *
 * Getting ArrayBuffers to pass our tests was giving me some trouble, and we
 * don't use them, so I left them out.
 */
export function deepEquals<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    let length: number, i: number;
    if (Array.isArray(a)) {
      const arrA = a as unknown[];
      const arrB = b as unknown[];
      length = arrA.length;
      if (length !== arrB.length) return false;
      for (i = length; i-- !== 0;)
        if (!deepEquals(arrA[i], arrB[i])) return false;
      return true;
    }
    let entry: any;
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (entry of a.entries()) if (!b.has(entry[0])) return false;
      for (entry of a.entries())
        if (!deepEquals(entry[1], b.get(entry[0]))) return false;
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (entry of a.entries()) if (!b.has(entry[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) || a instanceof ArrayBuffer) {
      throw new TypeError('Not implemented');
    }

    if (a.constructor === RegExp)
      return (
        (a as RegExp).source === (b as unknown as RegExp).source &&
        (a as RegExp).flags === (b as unknown as RegExp).flags
      );
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();

    const keys = Object.keys(a);
    const objA = a as { [key: string]: unknown };
    const objB = b as { [key: string]: unknown };
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;)
      if (!deepEquals(objA[keys[i]], objB[keys[i]])) return false;

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}
