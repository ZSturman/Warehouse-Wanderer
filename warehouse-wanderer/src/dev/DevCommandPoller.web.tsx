// The native filesystem command seam is unavailable in browsers. Web audits
// interact with the actual controls instead of injecting commands into state.
export function DevCommandPoller() {
  return null;
}
