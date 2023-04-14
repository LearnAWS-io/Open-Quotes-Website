export type BaseTable = {
  GSI1PK: string;
  GSI1SK: string;
  PK: string;
  SK: string;
};

export type QuoteRes = {
  author: string;
  title: string;
  quote: string;
  categories: string[];
  createdAt: string;
  postedBy: string;
  id: string;
} & BaseTable;
