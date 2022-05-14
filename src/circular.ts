// Symbol used to mark already visited nodes - helps with circular dependencies
const visitedMark = Symbol('VISITED_MARK');

const MAX_CLEANUP_DEPTH = 10;

export function removeCirculars<T = unknown>(obj: any, depth = 0): T {
  if (!obj) return obj;

  // Skip condition - either object is falsy, was visited or we go too deep
  const shouldSkip = !obj || obj[visitedMark] || depth > MAX_CLEANUP_DEPTH;

  // Copy object (we copy properties from it and mark visited nodes)
  const originalObj = obj;
  let result: any = {};

  Object.keys(originalObj).forEach((entry) => {
    const val = originalObj[entry];

    if (!shouldSkip) {
      if (typeof val === 'object') {
        // Value is an object - run object sanitizer
        originalObj[visitedMark] = true; // Mark current node as "seen" - will stop from going deeper into circulars
        const nextDepth = depth + 1;
        result[entry] = removeCirculars(val, nextDepth);
      } else {
        result[entry] = val;
      }
    } else {
      result = '[Circular]';
    }
  });

  return result;
}
