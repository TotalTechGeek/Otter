import {readdir} from 'fs/promises'
import {HttpController} from 'src/http';
import {Express} from 'express';

export async function discoverHttpControllers(app: Express) {
  const controllers = await search('', `${process.cwd()}/src/http`);
  controllers.forEach(c => load(c, app));
}

type DiscoveredController = {
  prefix: string;
  path: string;
}

function load(info: DiscoveredController, app: Express) {
  const { default: controller } = require(info.path);
  if (!(controller instanceof HttpController)) {
    console.log(`Illegal export of an index file in http: ${info.path}`);
    return;
  }

  console.log(`Registering controller with prefix: ${info.prefix}/`)
  controller.register(app, info.prefix);
}

async function search(prefix: string, directory: string): Promise<Array<DiscoveredController>> {
  const files = await readdir(directory, { withFileTypes: true })

  const controllers = files
    .filter(f => f.isFile() && /^index.[tj]s$/.test(f.name))
    .map(f => {
      return {
        prefix: prefix,
        path: `${directory}/${f.name}`
      }
    });

  await Promise.all(
    files
      .filter(f => f.isDirectory())
      .map(async f => {
        const newPrefix = `${prefix}/${f.name}`;
        const newDirectory = `${directory}/${f.name}`;
        const results = await search(newPrefix, newDirectory);
        controllers.push(...results);
      })
  )

  return controllers;
}