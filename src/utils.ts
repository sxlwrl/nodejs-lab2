export function safeJSON<T extends { [key: string]: unknown }>(
    data: string,
    fallback: T
): T {
    try {
        return JSON.parse(data) as T;
    } catch {
        return fallback;
    }
}
