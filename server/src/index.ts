require("dotenv").config();
import "reflect-metadata";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () =>
    console.log("server started on http://localhost:4000")
  );

  // Cach 1--------------------.
  //   await RequestContext.createAsync(orm.em, async () => {
  //     //   const post = orm.em.create(Post, {
  //     //     title: "my first post 2",
  //     //     createdAt: "",
  //     //     updatedAt: "",
  //     //   });
  //     //   await orm.em.persistAndFlush(post);
  //     //   console.log("post------------------", post);
  //     const posts = await orm.em.find(Post, {});
  //     console.log(posts);
  //   });
  // Cach 1--------------------.

  // Cach 2--------------------.
  //   const emFork = orm.em.fork();
  //   const post = emFork.create(Post, { title: "my first post with emFork" });
  //   await emFork.persistAndFlush(post);
  // Cach 2--------------------.

  //   Show all post
  //   const posts = await emFork.find(Post, {});
  //   console.log(posts);
};

main().catch((err) => console.error(err));
