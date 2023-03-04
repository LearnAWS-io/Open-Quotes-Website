import { AstroAWS } from "@astro-aws/constructs";
import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { AccessKey, Effect, User } from "aws-cdk-lib/aws-iam";
import * as PolicyStatement from "cdk-iam-floyd";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const quotesDbTable = new Table(this, "quotes-db-table", {
      tableName: "quotes-db-table",
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
    });

    // add secondary index
    quotesDbTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: AttributeType.STRING,
      },
    });

    const lexRecogTextUser = new User(this, "open-quotes-db-user");

    const lambdaInvokeFnPolicy = new PolicyStatement.Dynamodb({
      resources: [quotesDbTable.tableArn],
    }).toPutItem();

    lexRecogTextUser.addToPolicy(lambdaInvokeFnPolicy);

    const accessKey = new AccessKey(this, "open-quotes-db-user-key", {
      user: lexRecogTextUser,
    });

    const astroAws = new AstroAWS(this, "quotes-app", {
      websiteDir: "../",
      output: "server",
      cdk: {
        cloudfrontDistribution: {
          defaultBehavior: {
            cachePolicy: CachePolicy.CACHING_DISABLED,

          },
        },
        lambdaFunction: {
          environment: {
            TABLE_NAME: quotesDbTable.tableName,
          },
        },
      },
    });

    if (!astroAws.cdk.lambdaFunction) {
      throw Error("Unable to get lambda ref");
    }

    quotesDbTable.grantReadData(astroAws.cdk.lambdaFunction);

    new CfnOutput(this, "WebsiteDomain", {
      value: astroAws.cdk.cloudfrontDistribution.distributionDomainName,
    });
    /* new CfnOutput(this, "AccessKeyId", { value: accessKey.accessKeyId });
    new CfnOutput(this, "AccessKeySecret", {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
    }); */
  }
}
