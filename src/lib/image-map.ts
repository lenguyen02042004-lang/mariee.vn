const imgs = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export function resolveImg(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const fname = path.split('/').pop()!;
  const key = Object.keys(imgs).find(k => k.endsWith('/' + fname));
  return key ? imgs[key] : path;
}
