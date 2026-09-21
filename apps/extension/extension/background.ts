import {
  ApiRequest,
  ApiResult,
  BackgroundMessage,
} from '../src/contracts';

const API_BASE_URL =
  'https://b4joinacompany.netlify.app/api/v1/extension';
const CONSENT_KEY = 'consentedToAiRetention';

const consent = async (): Promise<boolean> => {
  const stored = await chrome.storage.local.get(CONSENT_KEY);
  return stored[CONSENT_KEY] === true;
};

const updateConsent = async (value: boolean): Promise<boolean> => {
  await chrome.storage.local.set({ [CONSENT_KEY]: value });
  return value;
};

const api = async (request: ApiRequest): Promise<ApiResult> => {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (request.method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(`${API_BASE_URL}${request.path}`, {
      method: request.method,
      headers,
      signal: AbortSignal.timeout(15000),
      ...(request.method === 'POST'
        ? { body: JSON.stringify(request.body) }
        : {}),
    });
    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const nested = data.error as { message?: string } | undefined;
      return {
        ok: false,
        status: response.status,
        error: nested?.message || `API request failed (${response.status}).`,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof DOMException && error.name === 'TimeoutError'
        ? 'The research request timed out. Try again.'
        : 'The b4join research API is currently unavailable.',
    };
  }
};

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundMessage,
    _sender,
    sendResponse: (response: unknown) => void,
  ) => {
    const task =
      message.type === 'api'
        ? api(message.request)
        : message.type === 'consent:get'
          ? consent()
          : message.type === 'consent:set'
            ? updateConsent(message.consented)
            : Promise.resolve(null);
    void task.then(sendResponse, () => sendResponse({ ok: false, error: 'Extension storage is unavailable.' }));
    return true;
  },
);
