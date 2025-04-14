export default class Store {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  save<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}
