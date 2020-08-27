# Apollo Link Lambda

[![Current npm version](https://img.shields.io/npm/v/@dealmore/apollo-link-lambda.svg)](https://www.npmjs.com/package/@dealmore/apollo-link-lambda) ![CI status](https://github.com/dealmore/apollo-link-lambda/workflows/CI/badge.svg)

When your GraphQL endpoint is served by an AWS Lambda function, this Apollo link can be used as an in-place replacement for the [HTTPLink](https://www.apollographql.com/docs/react/networking/advanced-http-networking/#the-httplink-object).
Instead of sending the GraphQL request over HTTP and API Gateway to your Lambda it uses the JavaScript [AWS SDK](https://aws.amazon.com/sdk-for-node-js/) to invoke the GraphQL Lambda directly.

This reduces the network overhead and costs because the requests are routed inside of AWS rather than over the public internet. Internally it creates an invoke event that has the same schema as an API Gateway proxy event.

![Functionality of the Apollo Link Lambda](https://github.com/dealmore/apollo-link-lambda/blob/main/docs/assets/functionality.png?raw=true)

## Features

✅ &nbsp;Support for [`@apollo/client`](https://www.npmjs.com/package/@apollo/client) 3.0+

✅ &nbsp;Fully compatible to HTTPLink

✅ &nbsp;Support for AWS API Gateway Events 1.0 & 2.0

## Usage

```sh
npm i --save @dealmore/apollo-link-lambda   # npm or
yarn add @dealmore/apollo-link-lambda       # yarn
```

> Please note that this package has peerDependencies to [`@apollo/client`](https://www.npmjs.com/package/@apollo/client), [`aws-sdk`](https://www.npmjs.com/package/aws-sdk) and [`graphql`](https://www.npmjs.com/package/graphql).
> So you might need to install this packages too if they are not already installed.

```js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { createLambdaLink } from '@dealmore/apollo-link-lambda';

const isServer = typeof window === 'undefined';

const client = new ApolloClient({
  ssrMode: isServer,
  link: isServer
    ? createLambdaLink({
        functionName: 'MyLambdaFunc',
      })
    : createHttpLink({
        uri:
          'https://psot142kj1.execute-api.eu-central-1.amazonaws.com/graphql',
      }),
  cache: new InMemoryCache(),
});
```

### Options

<!-- prettier-ignore-start -->
| Option         | Default    | Description |
| -------------- | ---------- | ----------- |
| `functionName` | (required) | The name of the Lambda function.<br />**Possible name formats:**<ul><li>Function name</li><li>Function ARN</li><li>Partial ARN</li></ul>For examples refer to the [AWS SDK documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property). |
| `httpMethod`   | `POST`     |  Sets the type of HTTP method for the invoke event.<br />**Possible values:**<ul><li>`POST`</li><li>`GET`</li></ul> |
| `payloadFormatVersion` | `1.0` | Sets the [payload format](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) version.<br />**Possible values:**<ul><li>`1.0`</li><li>`2.0`</li></ul> |
| `headers` | `{}`            | You can add custom headers here that should be included in every request.<pre lang="json">{  "key": "value"  }</pre> |
| `lambda` | `void`           | Allows to pass in a pre configured [Lambda instance](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html). |
<!-- prettier-ignore-end -->

## AWS IAM Policy

To invoke the GraphQL Lambda function make sure that associated AWS account or the AWS role of the client has the permission for the `lambda:InvokeFunction` action:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeLambda",
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:*:*:function:MyLambdaFunc"
    }
  ]
}
```

## License

MIT - see [LICENSE](./LICENSE) for details.
