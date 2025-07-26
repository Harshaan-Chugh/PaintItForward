import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

    const result = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      },
      ScanIndexForward: false // Most recent first
    }));

    return createResponse(200, {
      hours: result.Items || []
    });
  } catch (error: any) {
    console.error("Error listing hours:", error);
    if (error.message.includes('token') || error.message.includes('Invalid')) {
      return createErrorResponse(401, "Unauthorized");
    }
    return createErrorResponse(500, "Internal server error");
  }
};

