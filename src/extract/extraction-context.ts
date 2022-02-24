import {Request, Response} from 'express';

export type ExtractionContext = {
  req: Request,
  res: Response,
}
