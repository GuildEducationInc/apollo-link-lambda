import { ApolloLink, Observable } from '@apollo/client';
import { Body as GraphQLBody } from '@apollo/client/link/http/selectHttpOptionsAndBody';
import { Lambda } from 'aws-sdk';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { print } from 'graphql/language/printer';

import { LambdaLinkOptions } from './types';

interface Payload {
  body: string;
  httpMethod: 'POST' | 'GET';
  headers: { [key: string]: string };
}

function createPayload(payload: Payload, payloadFormatVersion: '1.0' | '2.0') {
  if (payloadFormatVersion === '2.0') {
    return {
      version: '2.0',
      headers: payload.headers,
      requestContext: {
        http: {
          method: payload.httpMethod,
        },
      },
      body: payload.body,
      isBase64Encoded: false,
    } as APIGatewayProxyEventV2;
  }

  return {
    headers: payload.headers,
    httpMethod: payload.httpMethod,
    body: payload.body,
    isBase64Encoded: false,
  } as APIGatewayProxyEvent;
}

export const createLambdaLink = (options: LambdaLinkOptions) => {
  const httpMethod = options.httpMethod ?? 'POST';
  const payloadFormatVersion = options.payloadFormatVersion ?? '1.0';
  const lambda = options.lambda ?? new Lambda(); // Used for testing purposes

  return new ApolloLink(({ getContext, operationName, variables, query }) => {
    const context = getContext();

    return new Observable((observer) => {
      const body: GraphQLBody = {
        operationName,
        variables,
        query: print(query),
      };

      const payload = createPayload(
        {
          httpMethod,
          body: JSON.stringify(body),
          headers: {
            ...options.headers,
            ...context.headers,
          },
        },
        payloadFormatVersion
      );

      lambda
        .invoke({
          FunctionName: options.functionName,
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify(payload),
        })
        .promise()
        .then((result) => {
          if (typeof result.Payload !== 'string') {
            throw new Error(
              `Received unsupported payload format from lambda: ${typeof result.Payload}, expected string.`
            );
          }

          const resPayload = JSON.parse(
            result.Payload
          ) as APIGatewayProxyResult;

          // Decode the body before further processing when base64 encoded
          const resBody = resPayload.isBase64Encoded
            ? Buffer.from(resPayload.body, 'base64').toString('utf-8')
            : resPayload.body;

          observer.next(JSON.parse(resBody));
          observer.complete();
        })
        .catch((error) => {
          if (error.result && error.result.errors && error.result.data) {
            observer.next(error.result);
          }

          observer.error(error);
        });
    });
  });
};
