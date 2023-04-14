import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./db";
import type { QuoteRes } from "./types";

const { TABLE_NAME: TableName } = import.meta.env;

export const getQuote = async (quoteId: string) => {
  const PK = { S: `QUOTE#${quoteId}` };

  const quotesQueryCmd = new GetItemCommand({
    TableName,
    Key: {
      PK,
      SK: PK,
    },
  });

  const res = await dbClient.send(quotesQueryCmd);
  if (!res.Item) {
    return null;
  }

  const quotes = unmarshall(res.Item) as QuoteRes;

  return quotes;
};
