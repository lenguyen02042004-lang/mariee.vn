const imgs = import.meta.glob('/src/assets/*.{jpg,jpeg,png,webp,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function resolveImg(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const fname = path.split('/').pop()!;
  const key = Object.keys(imgs).find(k => k.endsWith('/' + fname));
  if (key && imgs[key]) return imgs[key];
  return `/assets/${fname}`;
}
