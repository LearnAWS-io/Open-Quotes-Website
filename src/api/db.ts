import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export type BaseTable = {
  GSI1PK: string;
  GSI1SK: string;
  PK: string;
  SK: string;
};

export const dbClient = new DynamoDBClient({ region: "us-east-1" });
