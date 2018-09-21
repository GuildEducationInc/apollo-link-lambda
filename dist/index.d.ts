import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';
import { AWSError, Lambda } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { APIGatewayProxyEvent } from 'aws-lambda';
export interface LambdaOptions {
    functionName: string;
    httpMethod?: string;
    invocationType?: string;
}
export declare class LambdaLink extends ApolloLink {
    private options;
    constructor(config: LambdaOptions);
    readonly functionName: string;
    readonly invocationType: string;
    readonly httpMethod: string;
    request(operation: Operation): Observable<FetchResult> | null;
    invoke(payload: APIGatewayProxyEvent): Promise<PromiseResult<Lambda.InvocationResponse, AWSError>>;
}
