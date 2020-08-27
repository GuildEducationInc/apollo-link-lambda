import { Lambda } from 'aws-sdk';

export interface LambdaLinkOptions {
  httpMethod?: 'POST' | 'GET';
  functionName: string;
  payloadFormatVersion?: '1.0' | '2.0';
  headers?: { [key: string]: string };
  lambda?: Lambda;
}
