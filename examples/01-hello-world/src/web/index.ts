import {action, controller, rest} from 'otter';
import {greet} from './greet';

export default controller({
  actions: [
    action({
      route: rest('get /'),
      handler: greet
    }),
  ]
})
