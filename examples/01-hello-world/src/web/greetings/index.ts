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
      handler: greetByName
    }).before(
      extract(
        Extract.from.url('name')
      )
    ),
    action({
      route: rest('post /'),
      handler: greetByName
    }).before(
      extract(
        Extract.from.body({
          name: Schema.string()
        })
      )
    )
  ]
});

