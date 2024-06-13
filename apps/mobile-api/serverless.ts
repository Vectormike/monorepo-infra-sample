/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/no-import-module-exports */
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'edvise-backend',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: ['serverless-offline'],
  params: {
    dev: {
      deploymentBucket: 'edvise-dev-lambda-deployment-bucket',
      apiName: 'edvise-dev-backend',
      securityGroup: ['sg-0d9e547422211ef29'],
      subnet: ['subnet-0afa48a3679e65dcd', 'subnet-0dc045f23812511ed'],
    },
    prod: {
      deploymentBucket: 'edvise-prod-lambda-deployment-bucket',
      apiName: 'edvise-prod-backend',
      securityGroup: ['sg-0d9e547422211ef29'],
      subnet: ['subnet-0afa48a3679e65dcd', 'subnet-0dc045f23812511ed'],
    },
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    memorySize: 256,
    timeout: process.env['IS_OFFLINE'] ? 300 : 6,
    region: 'us-east-1',
    versionFunctions: false,
    logRetentionInDays: 90,
    deploymentBucket: {
      name: '${param:deploymentBucket}',
      serverSideEncryption: 'AES256',
    },
    httpApi: {
      name: '${param:apiName}',
    },
    iam: {
      role: {
        name: 'edvise-backend-serverless-iam',
        statements: [
          {
            Effect: 'Allow',
            Action: 's3:ListBucket',
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject'],
            Resource: ['arn:aws:s3:::*/*'],
          },
        ],
      },
    },
    vpc: {
      securityGroupIds: '${param:securityGroup}' as any,
      subnetIds: '${param:subnet}' as any,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DATABASE_URL: '${env:DATABASE_URL}',
      PROPELAUTH_URL: '${env:PROPELAUTH_URL}',
      PROPELAUTH_API_KEY: '${env:PROPELAUTH_API_KEY}',
    },
  },
  functions: {
    graphql: {
      handler: process.env['IS_OFFLINE'] ? '../../dist/apps/api/files/index.graphqlHandler' : 'index.graphqlHandler',
      events: [
        {
          httpApi: {
            method: 'POST',
            path: '/',
          },
        },
      ],
    },
  },
  ...(!process.env['IS_OFFLINE'] && {
    package: {
      artifact: '../../dist/apps/api/api.zip',
    },
  }),
};

module.exports = serverlessConfiguration;
