type GreetByNameParams = {
  name: string
}

export function greetByName(input: GreetByNameParams) {
  return `Hello, ${input.name}!`;
}