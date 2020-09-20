// Initializes the `tests` service on path `/tests`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tests } from './tests.class';
import hooks from './tests.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tests': Tests & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tests', new Tests(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tests');

  service.hooks(hooks);
}
