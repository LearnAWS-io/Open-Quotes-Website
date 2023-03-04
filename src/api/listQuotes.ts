import { AttributeValue, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { BaseTable, dbClient } from "./db";

const { TABLE_NAME: TableName } = import.meta.env;

export type QuoteRes = {
  author: string;
  title: string;
  quote: string;
  categories: string[];
  createdAt: string;
  postedBy: string;
  id: string;
} & BaseTable;

export const listQuotes = async (
  lastQuoteId?: string | null,
  firstQuoteId?: string | null
) => {
  let expression = `GSI1PK = :entity`;

  const expressionValues: Record<string, AttributeValue> = {
    ":entity": { S: "QUOTE" },
  };

  const PK = { S: `QUOTE#${firstQuoteId ?? lastQuoteId}` };

  const startKey: Record<string, AttributeValue> = {
    GSI1PK: { S: "QUOTE" },
    SK: PK,
    GSI1SK: PK,
    PK: PK,
  };

  console.log("firstQuoteId", firstQuoteId);
  console.log("lastQuoteId", lastQuoteId);

  const quotesQueryCmd = new QueryCommand({
    TableName,
    IndexName: "GSI1",
    KeyConditionExpression: expression,
    ExpressionAttributeValues: expressionValues,
    ExclusiveStartKey: firstQuoteId || lastQuoteId ? startKey : undefined,
    Limit: 3,
    ScanIndexForward: firstQuoteId ? true : false,
  });

  const res = await dbClient.send(quotesQueryCmd);
  if (!res.Items || res.Items.length === 0) {
    return null;
  }

  const quotes = res.Items.map((item) => {
    const quote = unmarshall(item) as QuoteRes;
    return { ...quote, id: quote.PK.split("#")[1] };
  });

  return {
    // NOTE: Reverse the items when revering scan
    quotes: firstQuoteId ? quotes.reverse() : quotes,
    hasMoreItems: Boolean(res.LastEvaluatedKey),
  };
};
