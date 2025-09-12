import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log('GraphQL Operation:', operation.operationName);
  console.log('Variables:', operation.variables);
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    console.error('Network error details:', {
      name: networkError.name,
      message: networkError.message,
      stack: networkError.stack,
    });
  }
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_KEY}`,
    },
  };
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export default client; 