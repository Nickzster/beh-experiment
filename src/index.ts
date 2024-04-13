import { Elysia } from "elysia";
import { printName } from "./test";
import { html } from "@elysiajs/html";
import swagger from "@elysiajs/swagger";
import todo from "./todo";

const alice = new Elysia().use(html()).get("/alice", () => printName("Alice"));

new Elysia()
  .use(alice)
  .use(html())
  .get("/", () => printName("bob"))
  .listen(53001);

new Elysia()
  .use(alice)
  .use(html())
  .get("/", () => printName("eve"))
  .get(
    "/user/:id",
    ({ params: { id }, set }) => {
      set.headers["Content-Type"] = "text/html";
      return JSON.stringify({
        msg: id,
      });
    },
    {
      afterHandle({ set }) {
        // Silly example, but demonstrates that you can update the headers after the request.
        set.headers["Content-Type"] = "application/json";
      },
    }
  )
  .post("/form", ({ body }) => body)
  .listen(53000);

new Elysia()
  .use(swagger())
  .get("/", () => "hi")
  .post("/hello", () => "world")
  .listen(53002);

// TODO App
new Elysia().use(todo).listen(8000);
