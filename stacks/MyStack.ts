import { StackContext, Table, Api, StaticSite } from "sst/constructs";

export function PaintItForwardStack({ stack }: StackContext) {
  // DynamoDB table for volunteer hours tracking
  const table = new Table(stack, "HoursTable", {
    fields: {
      email: "string",
      start_time: "string",
      status: "string"
    },
    primaryIndex: { partitionKey: "email", sortKey: "start_time" },
    globalIndexes: {
      statusIndex: { partitionKey: "status", sortKey: "start_time" }
    }
  });

  // API Gateway with Lambda functions
  const api = new Api(stack, "Api", {
    defaults: { 
      function: { 
        environment: { 
          TABLE_NAME: table.tableName,
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ""
        } 
      } 
    },
    routes: {
      "POST   /hours": "packages/api/src/handlers/createHour.handler",
      "GET    /hours": "packages/api/src/handlers/listHours.handler",
      "PATCH  /hours/{email}/{start_time}": "packages/api/src/handlers/updateHour.handler",
      "GET    /admin/pending": "packages/api/src/handlers/listPending.handler"
    }
  });

  // Grant table permissions to the API
  table.grantReadWriteData(api);

  // Frontend static site
  const site = new StaticSite(stack, "Site", {
    path: "packages/frontend",
    buildOutput: "out",
    buildCommand: "npm run build",
    environment: {
      NEXT_PUBLIC_API_URL: api.url,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ""
    }
  });

  stack.addOutputs({
    ApiUrl: api.url,
    SiteUrl: site.url,
    TableName: table.tableName
  });
}
