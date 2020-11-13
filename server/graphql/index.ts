import { ApolloServer } from 'apollo-server-express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import path from "path";
import { buildSchema } from 'type-graphql';
import { RecipeResolver } from '../recipe.resolver';

export const createSchema = async () => {
  const options: Redis.RedisOptions = {
    host: 'redis',
    port: 6379,
    retryStrategy: times => Math.max(times * 100, 3000),
  };

// create Redis-based pub-sub
  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });


// Build the TypeGraphQL schema
  return await buildSchema({
    resolvers: [ RecipeResolver ],
    validate: false,
    pubSub, // provide redis-based instance of PubSub
    emitSchemaFile: path.resolve(__dirname, 'schema.graphql'),
  });
}



export const createApolloServer = async function (): Promise<ApolloServer> {

  // create Redis-based pub-sub

  const schema = await createSchema();
  return new ApolloServer({
    schema,
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    uploads: false,
  });
};
