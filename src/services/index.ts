import { Application } from '../declarations';
import tests from './tests/tests.service';
import testingCampaigns from './testing-campaigns/testing-campaigns.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(tests);
  app.configure(testingCampaigns);
}
