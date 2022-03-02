import {Extract as BaseExtract} from 'otter/http';
import * as extractors from './extractors';

export const Extract = Object.freeze({
  from: Object.freeze({
    ...BaseExtract.from,
    ...extractors
  })
});
