'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var apolloLink = require('apollo-link');
var awsSdk = require('aws-sdk');
var printer = require('graphql/language/printer');

class LambdaLink extends apolloLink.ApolloLink {
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
        const body = { operationName, variables, query: printer.print(query) };
        const context = operation.getContext();
        const payload = {
            body: JSON.stringify(body),
            httpMethod: this.httpMethod,
            headers: context.headers
        };
        return new apolloLink.Observable(observer => {
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
        return new awsSdk.Lambda()
            .invoke({
            FunctionName: this.functionName,
            InvocationType: this.invocationType,
            Payload: JSON.stringify(payload)
        })
            .promise();
    }
}

exports.LambdaLink = LambdaLink;
