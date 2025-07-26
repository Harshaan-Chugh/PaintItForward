import type { APIGatewayProxyResult } from "aws-lambda";

export const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: { 
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

export const createErrorResponse = (statusCode: number, message: string): APIGatewayProxyResult => ({
  statusCode,
  headers: { 
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ error: message })
});