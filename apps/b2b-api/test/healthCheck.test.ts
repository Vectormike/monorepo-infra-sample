import gql from 'graphql-tag';
import { request } from './helpers';

describe('graphql server is online and accepts requests', () => {
  test('typename can be fetched', async () => {
    const query = gql`
      query {
        __typename
      }
    `;

    const { statusCode, body } = await request(query);
    expect(statusCode).toEqual(200);
    expect(body.errors).toBe(undefined);
    expect(body.data).toEqual({
      __typename: 'Query',
    });
  });
});
