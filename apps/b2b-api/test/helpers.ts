import { request as uReq } from 'undici';
import { print } from 'graphql';

type ReqOptions = Parameters<typeof uReq>[1];

export const request = async (query?: any, options?: ReqOptions) => {
  const { statusCode, body } = await uReq('http://localhost:3000', {
    ...options,
    body: query
      ? JSON.stringify({
        query: print(query),
      })
      : '',
    method: options?.method ?? 'POST',
    headers: options?.headers ?? {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env['EDVISE_DEVELOPER_API_KEY']}`,
    },
  });
  const jsonBody = await body.json();
  return { statusCode, body: jsonBody };
};
