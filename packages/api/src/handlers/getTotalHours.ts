import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, createErrorResponse } from "../utils/response.js";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Scan all approved hours from the database
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": "approved"
      }
    }));

    // Calculate total hours
    let totalHours = 0;
    
    if (result.Items) {
      for (const item of result.Items) {
        if (item.start_time && item.end_time) {
          const startTime = new Date(item.start_time);
          const endTime = new Date(item.end_time);
          const diffMs = endTime.getTime() - startTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          
          if (diffHours > 0) {
            totalHours += diffHours;
          }
        }
      }
    }

    return createResponse(200, {
      totalHours: totalHours.toFixed(1),
      totalEntries: result.Items?.length || 0
    });
  } catch (error: any) {
    console.error("Error calculating total hours:", error);
    return createErrorResponse(500, "Internal server error");
  }
};