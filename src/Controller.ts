import {extract, Extract} from './Extract';
import {route} from './Route';
import {action, Action} from './Action';

type Controller = {
  actions: Array<Action>
}

function controller(controller: Controller): Controller {
  throw 'TODO'
}

//
// Example
//

controller({
  actions: [
    action({
      route: route('get /:id'),
      extract: extract([
        Extract.from.url('id'),
        Extract.from.body<{ name: string, age: number }>(),
      ]),
      handler: function(input: { id: string, name: string, age: number }) {},
    }),
    action({
      route: route('delete /:di'),
      extract: extract([
        Extract.from.url('id'),
      ]),
      handler: function(input: { id: string }) {},
    }),
    action({
      route: route('post /'),
      extract: extract([
        Extract.from.body<{ name: string }>()
      ]),
      handler: function(input: { name: string, age: number }) {}
    })
  ]
})

