import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { verifyGoogleIdToken } from "../utils/auth.js";
import { createResponse, createErrorResponse } from "../utils/response.js";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

// Simple admin check - in production, use a proper admin management system
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers?.authorization || "";
    const { email: adminEmail } = await verifyGoogleIdToken(authHeader);
    
    // Check if user is admin
    if (!ADMIN_EMAILS.includes(adminEmail)) {
      return createErrorResponse(403, "Admin access required");
    }

    const pathEmail = event.pathParameters?.email;
    const startTime = event.pathParameters?.start_time;
    
    if (!pathEmail || !startTime) {
      return createErrorResponse(400, "Missing email or start_time in path");
    }

    // Check if record exists
    const existing = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        email: decodeURIComponent(pathEmail),
        start_time: decodeURIComponent(startTime)
      }
    }));

    if (!existing.Item) {
      return createErrorResponse(404, "Hour entry not found");
    }

    const body = JSON.parse(event.body || "{}");
    const { status } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return createErrorResponse(400, "Invalid status. Must be: pending, approved, or rejected");
    }

    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        email: decodeURIComponent(pathEmail),
        start_time: decodeURIComponent(startTime)
      },
      UpdateExpression: "SET #status = :status, updated_at = :updated_at",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updated_at": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    return createResponse(200, {
      message: `Hour entry ${status} successfully`,
      item: result.Attributes
    });
  } catch (error: any) {
    console.error("Error updating hour entry:", error);
    if (error.message.includes('token') || error.message.includes('Invalid')) {
      return createErrorResponse(401, "Unauthorized");
    }
    return createErrorResponse(500, "Internal server error");
  }
};

