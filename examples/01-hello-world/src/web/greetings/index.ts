import {extract, Extract, Schema} from 'otter';
import {action, controller, route} from 'otter/http';
import {greet} from './greet';
import {greetByName} from './greet-by-name';

export default controller({
  actions: [
    action({
      route: route('get /'),
      handler: greet
    }),
    action({
      route: route('get /:name'),
      handler: greetByName
    }).before(
      extract(
        Extract.from.url('name')
      )
    ),
    action({
      route: route('post /'),
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

