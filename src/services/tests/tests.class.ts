import {Db, MongoError, ObjectId} from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';
import createApplication from "@feathersjs/feathers";

type TestStatus = "CREATED" | "SCHEDULED" | "SUBMITTED" | "DONE";
type TestResult = "PENDING" | "NEGATIVE" | "POSITIVE";

interface TestDocumentQuery {
  testingCampaignID?: ObjectId,
  employeeIdentifier?: number,
  creationTimestamp?: Date,
  status?: TestStatus,
  result?: TestResult
}

interface IndexedTestDocumentQuery extends TestDocumentQuery{
  _id?: ObjectId
}

export class Tests extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);

    const client: Promise<Db> = app.get('mongoClient');

    client.then(db => {
      this.Model = db.collection('tests');
    });
  }

  async find(params?: createApplication.Params): Promise<any[] | createApplication.Paginated<any>> {
    return new Promise((resolve, reject) => {
      const queryToUse : TestDocumentQuery = params?.query ? params?.query : {};

      this.Model
        .find(queryToUse)
        .toArray((error: MongoError, documentList) => {
          if (error) {
            reject(error);
          }
          resolve(documentList);
        });
    });
  }

  async get(id: createApplication.Id, params?: createApplication.Params): Promise<any> {
    return new Promise((resolve, reject) => {
      const queryToUse : IndexedTestDocumentQuery = params?.query ? params?.query : {};
      queryToUse._id = new ObjectId(id);

      this.Model
        .find(queryToUse)
        .toArray((error: MongoError, documentList) => {
          if (error) {
            reject(error);
          }
          resolve(documentList);
        });
    });
  }
};
