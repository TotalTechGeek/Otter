import {action, controller, route, extract, Extract, Schema} from 'otter/http';
import {greet} from './greet';
import {greetByName} from './greet-by-name';

export default controller({
  actions: [
    action({
      route: route('get /'),
      handler: greet
    }).build(),

    action({
      route: route('get /:name'),
      handler: greetByName
    }).before(
      extract(
        Extract.from.url('name')
      )
    ).build(),

    action({
      route: route('post /'),
      handler: greetByName
    }).before(
      extract(
        Extract.from.body({
          name: Schema.string()
        })
      )
    ).build()
  ]
});

