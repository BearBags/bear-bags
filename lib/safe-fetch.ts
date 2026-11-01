// fetch for admin forms: a dropped connection comes back as a normal failed
// response, so handlers show an error and clear their busy state instead of
// throwing and leaving a button stuck on "Saving…".
export const safeFetch = (url: string, init?: RequestInit): Promise<Response> =>
  fetch(url, init).catch(() =>
    Response.json({ error: 'Network problem. Check your connection and try again.' }, { status: 503 }),
  );
