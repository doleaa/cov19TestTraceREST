import {Db, MongoError, ObjectId} from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';
import createApplication from "@feathersjs/feathers";

enum TestStatus {
  CREATED = "CREATED",
  SCHEDULED = "SCHEDULED",
  SUBMITTED = "SUBMITTED",
  DONE = "DONE"
}

enum TestResult {
  PENDING = "PENDING",
  NEGATIVE = "NEGATIVE",
  POSITIVE = "POSITIVE"
};

interface NewTestDto {
  _id?: string,
  testingCampaignID: string,
  employeeIdentifier: number
}

interface CreatedTestDto {
  _id: ObjectId,
  testingCampaignID: ObjectId,
  employeeIdentifier: number,
  creationTimestamp: Date,
  status: TestStatus,
  result: TestResult

}

//Insert schema interface
interface TestSchema {
  _id?: ObjectId,
  testingCampaignID: ObjectId,
  employeeIdentifier: number,
  creationTimestamp: Date,
  status: TestStatus,
  result: TestResult
}

//Read query interfaces
interface TestQuery {
  testingCampaignID?: ObjectId,
  employeeIdentifier?: number,
  creationTimestamp?: Date,
  status?: TestStatus,
  result?: TestResult
}
interface IndexedTestQuery extends TestQuery{
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
      const queryToUse : TestQuery = params?.query ? JSON.parse(JSON.stringify(params?.query)) : {};
      if (params?.query?.testingCampaignID) {
        queryToUse.testingCampaignID = new ObjectId(params?.query?.testingCampaignID);
      }

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
      const queryToUse : IndexedTestQuery = params?.query ? JSON.parse(JSON.stringify(params?.query)) : {};
      if (params?.query?.testingCampaignID) {
        queryToUse.testingCampaignID = new ObjectId(params?.query?.testingCampaignID);
      }
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

  async create(data: NewTestDto, params?: createApplication.Params): Promise<CreatedTestDto> {
    return new Promise((resolve, reject) => {

      const insertableDocument: TestSchema = {
        employeeIdentifier: data.employeeIdentifier,
        testingCampaignID: new ObjectId(data.testingCampaignID),
        creationTimestamp: new Date(),
        status: TestStatus.CREATED,
        result: TestResult.PENDING
      };
      if (data._id) {
        insertableDocument._id = new ObjectId(data._id);
      }

      this.Model.insertOne(insertableDocument).then(result => {
        if (result.insertedCount !== 1) {
          reject();
        }

        insertableDocument._id = result.insertedId;
        resolve(<CreatedTestDto>insertableDocument);
      });
    });
  }
};
