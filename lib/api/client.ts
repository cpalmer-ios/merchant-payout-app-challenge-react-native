import { z } from 'zod';

import { API_BASE_URL } from '@/constants';

import { ApiError, mapHttpError } from './errors';

type RequestOptions = {
  readonly method?: 'GET' | 'POST';
  readonly body?: string;
};

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const response = await send(path, options);
  const body = await readBody(response);

  if (!response.ok) {
    throw mapHttpError(response.status, body);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('Unexpected response from the server', response.status, 'invalid_response');
  }
  return parsed.data;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options.body ? { body: options.body } : {}),
    });
  } catch {
    throw new ApiError('Network request failed', 0, 'network');
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim().length === 0) {
    return null;
  }
  try {
    return parseJson(text);
  } catch {
    return null;
  }
}

function parseJson(text: string): unknown {
  return JSON.parse(text);
}
