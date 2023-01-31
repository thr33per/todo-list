/**
 * A single ToDo in our list of Todos.
 * @typedef {Object} ToDo
 * @property {string} id - A unique ID to identify this todo.
 * @property {string} label - The text of the todo.
 * @property {boolean} isDone - Marks whether the todo is done.
 * @property {string} userId - The user who owns this todo.
 */

class TodoList {
  static ID = "todo-list";
  static FLAGS = {
    TODOS: "todos",
  };
  static TEMPLATES = {
    TODOLIST: `modules/${this.ID}/templates/todo-list.hbs`,
  };

  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);
    if (shouldLog) {
      console.log(this.ID, "|", ...args);
    }
  }
}

class TodoListData {
  // All todos for all users
  static get allTodos() {
    const allTodos = game.users.reduce((accumulator, user) => {
      const userTodos = this.getTodosForUser(user.id);

      return {
        ...accumulator,
        ...userTodos,
      };
    }, {});
    return allTodos;
  }

  // Get todos for a single user
  static getTodosForUser(userId) {
    return game.users.get(userId)?.getFlag(TodoList.ID, TodoList.FLAGS.TODOS);
  }

  // Create a new todo for a user
  static createTodo(userId, todoData) {
    // generate a random id for this new ToDo and populate the userId
    const newTodo = {
      isDone: false,
      ...todoData,
      id: foundry.utils.randomID(16),
      userId,
    };
    // Construct the update to include the new todo
    const newTodos = {
      [newTodo.id]: newTodo,
    };
    // update the database with the new todo
    return game.users
      .get(userId)
      ?.setFlag(TodoList.ID, TodoList.FLAGS.TODOS, newTodos);
  }

  // Update todo by id
  static updateTodo(todoId, todoData) {
    const relevantTodo = this.allTodos[todoId];

    // construct the update to send
    const update = {
      [todoId]: todoData,
    };

    // update the database with the updated todo list
    return game.users
      .get(relevantTodo.userId)
      ?.setFlag(TodoList.ID, TodoList.FLAGS.TODOS, update);
  }

  // Delete a todo by id
  static deleteTodod(todoId) {
    const relevantTodo = this.allTodos[todoId];

    // Foundry specific syntax required to delete a key from a persisted object in the database
    const keyDeletion = {
      [`-=${todoId}`]: null,
    };

    // update the database with the updated todo list
    return game.users
      .get(relevantTodo.userId)
      ?.setFlag(TodoList.ID, TodoList.FLAGS.TODOS, keyDeletion);
  }

  static updateUserTodos(userId, updateData) {
    return game.users
      .get(userId)
      ?.setFlag(TodoList.ID, TodoList.FLAGS.TODOS, updateData);
  }
}

Hooks.once("devModeReaday", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(TodoList.ID);
});

Hooks.on("renderPlayerList", (playerlist, html) => {
  const tooltip = game.i18n.localize("TODO-LIST.button-title");
  // find the element which has our logged in user's id
  const loggedInUserListItem = html.find(`[data-user-id="${game.userId}"]`);
  // insert a button at the end of blah blah blah
  loggedInUserListItem.append(
    "<button type='button' class='todo-list-icon-button' title='${tooltip}'><i class='fas fa-tasks'></i></button>"
  );
});
