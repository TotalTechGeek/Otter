import {rest, extract, action, controller} from './coerce';
import {Extract} from 'src/extract';

controller({
  actions: [
    action({
      route: rest('get /:id'),
      extract: extract([
        Extract.from.url('id'),
        Extract.from.body<{ name: string, age: number }>(),
      ]),
      handler: function(input: { id: string, name: string, age: number }) {},
    }),
    action({
      route: rest('delete /:di'),
      extract: extract([
        Extract.from.url('id'),
      ]),
      handler: function(input: { id: string }) {},
    }),
    action({
      route: rest('post /'),
      extract: extract([
        Extract.from.body<{ name: string }>()
      ]),
      handler: function(input: { name: string, age: number }) {}
    })
  ]
})

