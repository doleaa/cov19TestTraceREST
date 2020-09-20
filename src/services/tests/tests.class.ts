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

  async create(data: NewTestDto, params?: createApplication.Params): Promise<CreatedTestDto[] | CreatedTestDto> {
    return new Promise((resolve, reject) => {

      const insertableDocument: TestSchema = {
        employeeIdentifier: data.employeeIdentifier,
        testingCampaignID: new ObjectId(data.testingCampaignID),
        creationTimestamp: new Date(),
        status: TestStatus.CREATED,
        result: TestResult.PENDING
      };

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
