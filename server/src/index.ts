require("dotenv").config();
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
// import { createClient } from "redis";
import Redis from "ioredis";
import session from "express-session";
import RedisStore from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { COOKIE_NAME, __prod__ } from "./constants";

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();

  const app = express();

  // Initialize client.
  let redis = new Redis();
  redis.connect().catch(console.error);

  // Initialize store.
  let redisStore = new RedisStore({
    client: redis,
    prefix: "reddit:",
    disableTouch: true
  });

  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true
    })
  );

  // Initialize session storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true, // only use cookies over HTTP
        sameSite: "lax", // csrf
        secure: __prod__ // cookie should only be sent over HTTPS
      },
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: "keyboard cat"
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false // don't validate schema
    }),
    context: ({ req, res }): MyContext => ({
      em: orm.em.fork(),
      req,
      res,
      redis
    })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(5000, () =>
    console.log("server started on http://localhost:5000")
  );
};

main().catch((err) => console.error(err));
