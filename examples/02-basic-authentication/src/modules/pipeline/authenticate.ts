import {HttpError, HttpPipelineInput} from 'otter/http';

export type Authenticated<T extends HttpPipelineInput> = T & {
  authenticated: {
    name: string;
  }
}

export function authenticate<T extends HttpPipelineInput>(input: T): Authenticated<T> {
  const base64 = input.req.header('authorization');
  if (!base64) {
    throw new HttpError('Authentication failed', 401);
  }

  try {
    const name = Buffer.from(base64, 'base64').toString();
    return {
      ...input,
      authenticated: { name },
    }
  } catch (e) {
    throw new HttpError('Authentication failed', 401, e);
  }
}
