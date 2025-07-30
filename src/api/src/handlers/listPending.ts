import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
    const { email } = await verifyGoogleIdToken(authHeader);

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(email)) {
      return createErrorResponse(403, "Admin access required");
    }

    const result = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "statusIndex",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": "pending"
      },
      ScanIndexForward: false // Most recent first
    }));

    return createResponse(200, {
      pending_hours: result.Items || []
    });
  } catch (error: any) {
    console.error("Error listing pending hours:", error);
    if (error.message.includes('token') || error.message.includes('Invalid')) {
      return createErrorResponse(401, "Unauthorized");
    }
    return createErrorResponse(500, "Internal server error");
  }
};

