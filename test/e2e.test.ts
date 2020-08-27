/**
 * We basically test here the same operation on HttpLink and LambdaLink
 * and compare wether the results are identical
 */

import * as path from 'path';
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  gql,
  HttpLink,
} from '@apollo/client';
import { Lambda } from 'aws-sdk';
import fetch from 'cross-fetch';

import { createSAMLocal, SAMLocal } from './utils/SAMLocal';
import { createLambdaLink } from '../lib';

/**
 * Tests LambdaLink e2e with AWS SAM
 */

describe('E2E Test', () => {
  // TODO: https://www.npmjs.com/package/get-port
  const samSDKPort = 3000;
  const samApiPort = 3001;

  let samSDK: SAMLocal;
  let samApi: SAMLocal;
  let sdkApolloClient: ApolloClient<NormalizedCacheObject>;
  let apiApolloClient: ApolloClient<NormalizedCacheObject>;

  beforeAll(async () => {
    // We start them in order to avoid double initialization of the docker container
    samSDK = await createSAMLocal(
      'sdk',
      path.resolve(__dirname, './fixture'),
      samSDKPort
    );
    samApi = await createSAMLocal(
      'api',
      path.resolve(__dirname, './fixture'),
      samApiPort
    );

    const lambda = new Lambda({
      endpoint: `http://localhost:${samSDKPort}`,
      region: 'local',
    });

    sdkApolloClient = new ApolloClient({
      ssrMode: true,
      link: createLambdaLink({
        functionName: 'apolloServer',
        lambda,
      }),
      cache: new InMemoryCache(),
    });

    apiApolloClient = new ApolloClient({
      ssrMode: true,
      link: new HttpLink({ uri: `http://localhost:${samApiPort}`, fetch }),
      cache: new InMemoryCache(),
    });
  });

  afterAll(async () => {
    // Gracefully shutdown the sam process
    await Promise.all([samSDK.kill(), samApi.kill()]);
  });

  test('Query', async () => {
    const query = gql`
      query Hello {
        hello
      }
    `;

    const apiResult = await apiApolloClient.query({ query });
    const sdkResult = await sdkApolloClient.query({ query });

    expect(apiResult).toMatchObject(sdkResult);
  });
});
