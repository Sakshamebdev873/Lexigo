import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { schema, root } from './graphql/schema';

export const buildApp = () => {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', routes);

  app.use(
    '/graphql',
    graphqlHTTP({ schema, rootValue: root, graphiql: true })
  );

  app.use(errorHandler);
  return app;
};
