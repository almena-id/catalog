import "server-only";

const apiUrl = () => process.env.CATALOG_API_URL ?? "https://api.almena.id";

/**
 * A GET on the API's public catalogue, from the server. `data` is `null`
 * when the API cannot be reached or answers with an error: the page says the
 * catalog is unavailable rather than failing.
 */
export async function api<T>(path: string): Promise<{ data: T | null; status: number }> {
  try {
    const response = await fetch(`${apiUrl()}/api/v1${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return { data: null, status: response.status };
    return { data: (await response.json()) as T, status: response.status };
  } catch {
    return { data: null, status: 0 };
  }
}
