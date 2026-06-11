export function api(path, opts = {}) {
  const base = '/api';
  const res = fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...opts,
  }).then((r) => {
    if (!r.ok) return r.text().then((t) => { throw new Error(t || r.statusText); });
    return r.json().catch(() => null);
  });
  return res;
}
