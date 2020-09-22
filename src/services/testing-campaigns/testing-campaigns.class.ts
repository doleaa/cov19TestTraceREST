import {Db, MongoError, ObjectId} from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';
import createApplication from "@feathersjs/feathers";
import {parse} from "@typescript-eslint/parser";

enum TestingCampaignType {
  TRACE = "TRACE",
  PROJECT = "PROJECT"
}

enum TestingCampaignStatus {
  CREATED = "CREATED",
  SCHEDULED = "SCHEDULED",
  SUBMITTED_TESTS = "SUBMITTED_TESTS",
  DONE = "DONE"
}

interface NewTestingCampaignDto {
  _id?: string,
  title: string,
  traceID: string,
  createdBy: number,
  type: TestingCampaignType
}

interface CreatedTestingCampaignDto {
  _id: ObjectId,
  title: string,
  traceID: ObjectId,
  createdBy: number,
  permissionedEmployeeIds: number[],
  type: TestingCampaignType,
  creationTimestamp: Date,
  status: TestingCampaignStatus,
  completionTimestamp: Date
}

interface TestingCampaignSchema {
  _id?: ObjectId,
  title: string,
  traceID: ObjectId,
  createdBy: number,
  permissionedEmployeeIds: number[],
  type: TestingCampaignType,
  creationTimestamp: Date,
  status: TestingCampaignStatus,
  completionTimestamp: Date | null
}

interface MongoNumberContainer {
  $in: number[]
}

interface TestingCampaignQuery {
  title?: string,
  traceID?: ObjectId,
  createdBy?: number,
  permissionedEmployeeIds?: MongoNumberContainer,
  type?: TestingCampaignType,
  creationTimestamp?: Date,
  status?: TestingCampaignStatus,
  completionTimestamp?: Date
}

interface IndexedTestingCampaignQuery extends TestingCampaignQuery {
  _id?: ObjectId
}

export class TestingCampaigns extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);

    const client: Promise<Db> = app.get('mongoClient');

    client.then(db => {
      this.Model = db.collection('testingCampaigns');
    });
  }

  async find(params?: createApplication.Params): Promise<any[] | createApplication.Paginated<any>> {
    return new Promise((resolve, reject) => {
      const queryToUse : TestingCampaignQuery = params?.query ? JSON.parse(JSON.stringify(params?.query)) : {};
      if (params?.query?.traceID) {
        queryToUse.traceID = new ObjectId(params?.query?.traceID);
      }
      if (params?.query?.permissionedEmployeeIds) {
        if (Array.isArray(params?.query?.permissionedEmployeeIds)) {
          queryToUse.permissionedEmployeeIds = {
            $in: params?.query?.permissionedEmployeeIds.map(item => parseInt(item))
          };
        } else {
          queryToUse.permissionedEmployeeIds = {
            $in: [ parseInt(params?.query?.permissionedEmployeeIds) ]
          };
        }
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
      const queryToUse : IndexedTestingCampaignQuery = params?.query ? JSON.parse(JSON.stringify(params?.query)) : {};
      if (params?.query?.traceID) {
        queryToUse.traceID = new ObjectId(params?.query?.traceID);
      }
      if (params?.query?.permissionedEmployeeIds) {
        if (Array.isArray(params?.query?.permissionedEmployeeIds)) {
          queryToUse.permissionedEmployeeIds = {
            $in: params?.query?.permissionedEmployeeIds.map(item => parseInt(item))
          };
        } else {
          queryToUse.permissionedEmployeeIds = {
            $in: [ parseInt(params?.query?.permissionedEmployeeIds) ]
          };
        }
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

  async create(data: NewTestingCampaignDto, params?: createApplication.Params): Promise<CreatedTestingCampaignDto> {
    return new Promise((resolve, reject) => {

      const insertableDocument: TestingCampaignSchema = {
        title: data.title,
        traceID: new ObjectId(data.traceID),
        createdBy: data.createdBy,
        permissionedEmployeeIds: [data.createdBy],
        type: TestingCampaignType.TRACE,
        creationTimestamp: new Date(),
        status: TestingCampaignStatus.CREATED,
        completionTimestamp: null
      };
      if (data._id) {
        insertableDocument._id = new ObjectId(data._id);
      }

      this.Model.insertOne(insertableDocument).then(result => {
        if (result.insertedCount !== 1) {
          reject();
        }

        insertableDocument._id = result.insertedId;
        resolve(<CreatedTestingCampaignDto>insertableDocument);
      });
    });
  }
};
