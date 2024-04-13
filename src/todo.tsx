import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import swagger from "@elysiajs/swagger";

interface TodoItem {
  id: number;
  description: string;
  done: boolean;
}

let nextID = 0;
let TODOs: TodoItem[] = [
  { id: -1, description: "wash the dishes", done: false },
];

const Document = ({
  description,
  children,
}: {
  children: any /* React.ReactNode. Need to figure out how to type this properly using bun. */;
  description: string;
}) => (
  <html>
    <head>
      <script
        src="https://unpkg.com/htmx.org@1.9.11"
        integrity="sha384-0gxUXCCR8yv9FM2b+U3FDbsKthCI66oH5IA9fHppQq9DDMHuMauqq1ZHBpJxQ0J0"
        crossorigin="anonymous"
      ></script>
      <title>{description}</title>
    </head>
    <body>
      <h1>ToDo App</h1>
      <br />
      <form hx-post="/add" hx-swap="innerHTML" hx-target="#todo-items">
        <input
          name="new-todo"
          type="text"
          placeholder="Enter new todo..."
        ></input>
        <button>Add</button>
      </form>
      <br />
      {children}
    </body>
  </html>
);

const Todo = ({ item }: { item: TodoItem }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "left",
      gap: "1em",
    }}
  >
    <p
      hx-trigger="click"
      hx-put="/toggle"
      hx-vals={`{"id": ${item.id}}`}
      hx-target="#todo-items"
      hx-swap="innerHTML"
      style={{
        textDecoration: item.done ? "line-through" : "none",
        cursor: "pointer",
      }}
    >
      {item.description}
    </p>
    <button
      hx-trigger="click"
      hx-delete="/delete"
      hx-confirm="Are you sure you want to delete this item?"
      hx-vals={`{"id": ${item.id}}`}
      hx-target="#todo-items"
      hx-swap="innerHTML"
    >
      Delete
    </button>
  </div>
);

const AllTodos = () => {
  return (
    <>
      {TODOs.map((item) => (
        <Todo item={item} />
      ))}
    </>
  );
};

const todo = new Elysia()
  .use(swagger())
  .use(html())
  .get("/", () => (
    <Document description="Todo app">
      <div id="todo-items">
        <AllTodos />
      </div>
    </Document>
  ))
  .post("/add", async ({ request }) => {
    const newTodoData = (await request.formData()).get("new-todo");
    if (newTodoData === null) {
      return <AllTodos />;
    }

    const newTodoId = nextID;
    nextID = nextID + 1;

    const newTodo = {
      id: newTodoId,
      description: newTodoData.toString(),
      done: false,
    };

    console.log("creating new todo item", newTodo);

    TODOs.push(newTodo);

    return <AllTodos />;
  })
  .put(
    "/toggle",
    ({ body }) => {
      // TODO: Figure out how to read this request's body.

      const idToToggle = body.id;
      const itemToToggle = TODOs.findIndex(
        (item) => item.id === parseInt(idToToggle, 10)
      );

      if (itemToToggle !== -1)
        TODOs[itemToToggle].done = !TODOs[itemToToggle].done;

      return <AllTodos />;
    },
    {
      body: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/delete",
    ({ body }) => {
      const itemToRemove = body.id;

      TODOs = TODOs.filter((item) => item.id !== parseInt(itemToRemove, 10));

      return <AllTodos />;
    },
    {
      body: t.Object({
        id: t.String(),
      }),
    }
  );

export default todo;
