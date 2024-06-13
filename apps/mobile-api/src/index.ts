import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import {
  handlers, startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import { authenticateUser } from '@edvise/auth';
import { Context } from '@edvise/pothos/builder';
import { schema } from '@edvise/pothos/schema';

export const server = new ApolloServer<Context>({
  introspection: true,
  schema,
  plugins: [
    ApolloServerPluginLandingPageDisabled(),
  ],
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event }) => {
      const authHeader = event.headers['authorization'];
      if (!authHeader) throw new Error('No authorization header provided');
      if (authHeader === `Bearer ${process.env['EDVISE_DEVELOPER_API_KEY']}`) {
        return {
          user: {
            role: 'developer',
          },
        };
      }
      return authenticateUser(authHeader);
    },
  },
);
