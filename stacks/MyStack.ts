/// <reference path="../.sst/platform/config.d.ts" />

// DynamoDB table for volunteer hours tracking
const table = new sst.aws.Dynamo("HoursTable", {
  fields: {
    email: "string",
    start_time: "string",
    status: "string"
  },
  primaryIndex: { hashKey: "email", rangeKey: "start_time" },
  globalIndexes: {
    statusIndex: { hashKey: "status", rangeKey: "start_time" }
  }
});

// API Gateway with Lambda functions
const api = new sst.aws.ApiGatewayV2("Api", {
  cors: {
    allowCredentials: true,
    allowHeaders: ["content-type", "authorization"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowOrigins: ["*"]
  }
});

// Add routes with environment variables and permissions
api.route("POST /hours", {
  handler: "packages/api/src/handlers/createHour.handler",
  environment: {
    TABLE_NAME: table.name,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || ""
  },
  permissions: [table]
});

api.route("GET /hours", {
  handler: "packages/api/src/handlers/listHours.handler", 
  environment: {
    TABLE_NAME: table.name,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || ""
  },
  permissions: [table]
});

api.route("PATCH /hours/{email}/{start_time}", {
  handler: "packages/api/src/handlers/updateHour.handler",
  environment: {
    TABLE_NAME: table.name,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || ""
  },
  permissions: [table]
});

api.route("GET /admin/pending", {
  handler: "packages/api/src/handlers/listPending.handler",
  environment: {
    TABLE_NAME: table.name,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || ""
  },
  permissions: [table]
});

api.route("PATCH /admin/hours/{email}/{start_time}", {
  handler: "packages/api/src/handlers/adminUpdateHour.handler",
  environment: {
    TABLE_NAME: table.name,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    ADMIN_EMAILS: process.env.ADMIN_EMAILS || ""
  },
  permissions: [table]
});

// Frontend static site
const site = new sst.aws.StaticSite("Site", {
  build: {
    command: "npm run build",
    output: "out"
  },
  path: "packages/frontend",
  environment: {
    NEXT_PUBLIC_API_URL: api.url,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ""
  }
});

// Export outputs
export const outputs = {
  api: api.url,
  site: site.url,
  table: table.name
};