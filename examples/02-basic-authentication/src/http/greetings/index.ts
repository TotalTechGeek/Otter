import {action, controller, route, extract, HttpPipelineInput} from 'otter/http';
import {greetByName} from './greet-by-name';

import {Extract} from '../../modules/extract';
import {authenticate} from '../../modules/pipeline';

const a = action({
  route: route('get /'),
  handler: greetByName
}).before(
  authenticate,
  extract(
    Extract.from.authentication(),
    Extract.from.url('hello')
  )
)


export default controller({
  actions: [
    action({
      route: route('get /'),
      handler: greetByName
    }).before(
      extract(
        Extract.from.authentication(),
        Extract.from.url('hello')
      )
    )
  ]
});

