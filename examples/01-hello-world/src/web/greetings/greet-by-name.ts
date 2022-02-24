import {GreetingModel} from './greeting-model';

export function greetByName(input: GreetingModel) {
  return `Hello, ${input.name}!`;
}