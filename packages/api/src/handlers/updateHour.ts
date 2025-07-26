import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
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
    
    const pathEmail = event.pathParameters?.email;
    const startTime = event.pathParameters?.start_time;
    
    if (!pathEmail || !startTime) {
      return createResponse(400, { error: "Missing email or start_time in path" });
    }

    // Only allow users to update their own records
    if (email !== decodeURIComponent(pathEmail)) {
      return createResponse(403, { error: "Cannot update other users' records" });
    }

    // Check if record exists
    const existing = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        email: pathEmail,
        start_time: decodeURIComponent(startTime)
      }
    }));

    if (!existing.Item) {
      return createResponse(404, { error: "Hour entry not found" });
    }

    // Only allow updates to pending entries
    if (existing.Item.status !== "pending") {
      return createResponse(400, { error: "Can only update pending entries" });
    }

    const body = JSON.parse(event.body || "{}");
    const { end_time, description } = body;

    const updateExpression = [];
    const expressionAttributeValues: any = {
      ":updated_at": new Date().toISOString()
    };

    if (end_time) {
      updateExpression.push("end_time = :end_time");
      expressionAttributeValues[":end_time"] = end_time;
    }

    if (description !== undefined) {
      updateExpression.push("description = :description");
      expressionAttributeValues[":description"] = description;
    }

    updateExpression.push("updated_at = :updated_at");

    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        email: pathEmail,
        start_time: decodeURIComponent(startTime)
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));

    return createResponse(200, result.Attributes);
  } catch (error: any) {
    console.error("Error updating hour entry:", error);
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