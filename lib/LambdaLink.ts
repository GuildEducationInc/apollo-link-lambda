import { ApolloLink } from '@apollo/client';

import { LambdaLinkOptions } from './types';
import { createLambdaLink } from './createLambdaLink';

export class LambdaLink extends ApolloLink {
  constructor(public options: LambdaLinkOptions) {
    super(createLambdaLink(options).request);
  }
}
