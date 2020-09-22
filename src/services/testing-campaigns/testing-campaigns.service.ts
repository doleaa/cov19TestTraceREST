// Initializes the `testingCampaigns` service on path `/testing-campaigns`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TestingCampaigns } from './testing-campaigns.class';
import hooks from './testing-campaigns.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'testing-campaigns': TestingCampaigns & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/testing-campaigns', new TestingCampaigns(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('testing-campaigns');

  service.hooks(hooks);
}
