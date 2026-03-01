const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

function buildFunctionUrl(name, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return `${SUPABASE_URL}/functions/v1/${name}${queryString ? `?${queryString}` : ''}`;
}

async function parseErrorResponse(response, fallback) {
  const bodyText = await response.text();
  try {
    const payload = JSON.parse(bodyText);
    if (payload?.message) return payload.message;
  } catch {
    // ignore parse failures
  }
  return fallback;
}

export async function callEdgeFunction({
  name,
  method = 'GET',
  token,
  query,
  body,
}) {
  const url = buildFunctionUrl(name, query);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await parseErrorResponse(response, `${name} failed: ${response.status}`);
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}
