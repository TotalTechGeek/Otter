import {action, controller, route, extract} from 'otter/http';
import {greetByName} from './greet-by-name';

import {Extract} from '../../modules/extract';
import {authenticate} from '../../modules/pipeline';

export default controller({
  actions: [
    action({
      route: route('get /'),
      handler: greetByName
    }).before(
      authenticate(),
      extract(
        Extract.from.authentication(),
        Extract.from.url('hello')
      )
    ).build()
  ]
});
