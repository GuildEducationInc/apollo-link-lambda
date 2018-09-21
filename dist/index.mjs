import { ApolloLink, Observable } from 'apollo-link';
import { Lambda } from 'aws-sdk';
import { print } from 'graphql/language/printer';

class LambdaLink extends ApolloLink {
    constructor(config) {
        super();
        this.options = config;
    }
    get functionName() {
        return this.options.functionName;
    }
    get invocationType() {
        return this.options.invocationType || 'RequestResponse';
    }
    get httpMethod() {
        return this.options.httpMethod || 'POST';
    }
    request(operation) {
        const { operationName, extensions, variables, query } = operation;
        const body = { operationName, variables, query: print(query) };
        const context = operation.getContext();
        const payload = {
            body: JSON.stringify(body),
            httpMethod: this.httpMethod,
            headers: context.headers
        };
        return new Observable(observer => {
            this.invoke(payload)
                .then(result => {
                const payload = JSON.parse(result.Payload);
                const body = JSON.parse(payload.body);
                observer.next(body);
                observer.complete();
                return result;
            })
                .catch(err => {
                observer.error(err);
            });
        });
    }
    invoke(payload) {
        return new Lambda()
            .invoke({
            FunctionName: this.functionName,
            InvocationType: this.invocationType,
            Payload: JSON.stringify(payload)
        })
            .promise();
    }
}

export { LambdaLink };
