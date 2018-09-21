import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link'
import { Body } from 'apollo-link-http-common'
import { AWSError, Lambda } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { print } from 'graphql/language/printer'

export interface LambdaOptions {
  functionName: string
  httpMethod?: string
  invocationType?: string
}

export class LambdaLink extends ApolloLink {
  private options: LambdaOptions

  constructor(config: LambdaOptions) {
    super()
    this.options = config
  }

  get functionName() {
    return this.options.functionName
  }

  get invocationType() {
    return this.options.invocationType || 'RequestResponse'
  }

  get httpMethod() {
    return this.options.httpMethod || 'POST'
  }

  request(operation: Operation): Observable<FetchResult> | null {
    const { operationName, extensions, variables, query } = operation
    const body: Body = { operationName, variables, query: print(query) }
    const context = operation.getContext()
    const payload = {
      body: JSON.stringify(body),
      httpMethod: this.httpMethod,
      headers: context.headers
    } as APIGatewayProxyEvent

    return new Observable(observer => {
      this.invoke(payload)
        .then(result => {
          const payload = JSON.parse(result.Payload as string) as APIGatewayProxyResult
          const body = JSON.parse(payload.body)
          observer.next(body)
          observer.complete()

          return result
        })
        .catch(err => {
          observer.error(err)
        })
    })
  }

  invoke(
    payload: APIGatewayProxyEvent
  ): Promise<PromiseResult<Lambda.InvocationResponse, AWSError>> {
    return new Lambda()
      .invoke({
        FunctionName: this.functionName,
        InvocationType: this.invocationType,
        Payload: JSON.stringify(payload)
      })
      .promise()
  }
}