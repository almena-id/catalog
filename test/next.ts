/**
 * What the mocks in `setup.ts` stand in for, for a test to arrange and read:
 * the request's headers, the browser's cookies (with what each was set with)
 * and `redirect`, thrown as Next's is.
 */
export class Redirected extends Error {
  constructor(readonly to: string) {
    super(`redirect ${to}`);
  }
}

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
  expires?: Date;
};

export const request = {
  headers: new Headers(),
  cookies: new Map<string, { value: string; options: CookieOptions }>(),
};

/** A fresh request: no headers, no cookies. */
export function resetRequest() {
  request.headers = new Headers();
  request.cookies.clear();
}
