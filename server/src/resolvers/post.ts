import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  // Show all posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // Show post
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // Create post
  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx()
    { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, {
      title,
      createdAt: "",
      updatedAt: "",
    });
    await em.persistAndFlush(post);
    return post;
  }

  // Update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }

    return post;
  }

  // Delete post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<boolean> {
    const res = await em.nativeDelete(Post, { id });
    console.log("res: ", res);

    return true;
  }
}
