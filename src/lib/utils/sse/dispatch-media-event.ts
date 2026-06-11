export function dispatchMediaEvent(name: string, raw: string): void {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail: JSON.parse(raw) }));
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[SSE] malformed payload for ${name}:`, raw);
    }
  }
}
