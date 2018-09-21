# Apollo Link Lambda

The Lambda link is similar in functionality to the [http-link](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-http) except it allows direct invocation of an AWS Lambda vs requiring an HTTP call. This has the benefit of allowing cross-lambda calls to stay within a given VPC and not have to go out to the greater internet and back in via API Gateway

## Usage

### JavaScript

```javascript
import { LambdaLink } from "apollo-link-lambda";

const options = {
  functionName: 'MyLambdaFunc'
  httpMethod: 'GET'
  invocationType: 'Event'
};
const lambdaLink = new LambdaLink(options)
// Use just like you would an HTTP link
```

### TypeScript

```typescript
import { LambdaLink, LambdaOptions } from "apollo-link-lambda";

const options: LambdaOptions = {
  functionName: 'MyLambdaFunc'
  httpMethod: 'GET'
  invocationType: 'Event'
};
const lambdaLink = new LambdaLink(options)
// Use just like you would an HTTP link
```
