import {action, controller, extract, Extract, rest, Schema} from 'otter';
import {greet} from './greet';
import {greetByName} from './greet-by-name';

export default controller({
  actions: [
    action({
      route: rest('get /'),
      handler: greet
    }),
    action({
      route: rest('get /:name'),
      extract: extract([
        Extract.from.url('name'),
      ]),
      handler: greetByName
    }),
    action({
      route: rest('post /'),
      extract: extract([
        Extract.from.body({
          name: Schema.string()
        })
      ]),
      handler: greetByName
    })
  ]
});
