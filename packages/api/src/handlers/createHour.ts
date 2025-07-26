import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { verifyGoogleIdToken } from "../utils/auth.js";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers?.authorization || "";
    const { email } = await verifyGoogleIdToken(authHeader);
    const body = JSON.parse(event.body || "{}");

    const { start_time, end_time, description } = body;
    if (!start_time || !end_time) {
      return createResponse(400, { error: "Missing start_time or end_time" });
    }

    // Validate date format
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return createResponse(400, { error: "Invalid date format" });
    }

    if (endDate <= startDate) {
      return createResponse(400, { error: "End time must be after start time" });
    }

    const item = {
      email,
      start_time,
      end_time,
      status: "pending",
      description: description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await ddb.send(new PutCommand({ 
      TableName: TABLE_NAME, 
      Item: item 
    }));

    return createResponse(201, item);
  } catch (error: any) {
    console.error("Error creating hour entry:", error);
    return createResponse(401, { error: "Unauthorized" });
  }
};

const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS"
  },
  body: JSON.stringify(body)
});