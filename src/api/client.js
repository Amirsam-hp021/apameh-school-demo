/**
 * Mock transport.
 *
 * Every API function returns a Promise, exactly like an Axios call would.
 * To connect the real backend later, replace the body of each API function
 * with an Axios request (e.g. `http.get('/users', { params })`) and keep the
 * same function names and return shapes. Pages never touch mock data directly.
 */

const BASE_LATENCY_MS = 300;

/** Resolve with a deep copy of `data` after a short, realistic delay. */
export function respond(data, latency = BASE_LATENCY_MS) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data === undefined ? undefined : structuredClone(data)), latency + Math.random() * 200);
  });
}

/** Reject with an Error (used for "not found" and similar cases). */
export function fail(message, latency = BASE_LATENCY_MS) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), latency);
  });
}

/** Generate a unique id for newly created mock records. */
export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
