import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { verifyGoogleIdToken } from "../utils/auth.js";
import { createResponse, createErrorResponse } from "../utils/response.js";
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
      return createErrorResponse(400, "Missing start_time or end_time");
    }

    // Validate date format
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return createErrorResponse(400, "Invalid date format");
    }

    if (endDate <= startDate) {
      return createErrorResponse(400, "End time must be after start time");
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
    if (error.message.includes('token') || error.message.includes('Invalid')) {
      return createErrorResponse(401, "Unauthorized");
    }
    return createErrorResponse(500, "Internal server error");
  }
};

