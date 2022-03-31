console.log('todo-list | Hello World');
/**
 * A single ToDo in our list of Todos.
 * @typedef {Object} ToDo
 * @property {string} id - A unique ID to identify this todo.
 * @property {string} label - The text of the todo.
 * @property {boolean} isDone - Marks whether the todo is done.
 * @property {string} userId - The user who owns this todo.
 */

class ToDoList {
  static ID = 'todo-list';
  
  static FLAGS = {
    TODOS: 'todos'
  }
  
  static TEMPLATES = {
    TODOLIST: `modules/${this.ID}/templates/todo-list.hbs`
  }
  
  static log(force, ...args) {  
    const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

    if (shouldLog) {
      console.log(this.ID, '|', ...args);
    }
  }
  
}
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(ToDoList.ID);
});

class ToDoListData {
  //READ
  static getToDosForUser(userId) {
    /*
    Get the appropriate user from the game.users Collection.
    Leverage User#getFlag, providing our module as scope, and our flag name as key.
    */
    return game.users.get(userId)?.getFlag(ToDoList.ID, ToDoList.FLAGS.TODOS);
  }
  //CREATE
  static createToDo(userId, toDoData) {
    // generate a random id for this new ToDo and populate the userID
    const newToDo = {
      isDone: false,
      ...toDoData,
      id: foundry.utils.randomID(16),
      userId
    }

    // construct the update to insert the new ToDo
    const newToDos = {
      [newToDo.id]: newToDo
    }

    // update the database with the new ToDos
    return game.users.get(userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, newToDos);
  }

  //GET all ToDos
  static get allToDos() {
    const allToDos = game.users.reduce((accumulator, user) => {
      const userToDos = this.getToDosForUser(user.id);

      return {
        ...accumulator,
        ...userToDos
      }
    }, {});

    return allToDos;
  }
  //UPDATE
  static updateToDo(toDoId, updateData) {
    const relevantToDo = this.allToDos[toDoId];

    // construct the update to send
    const update = {
      [toDoId]: updateData
    }

    // update the database with the updated ToDo list
    return game.users.get(relevantToDo.userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, update);
  }
  //BULK UPDATE
  static updateUserToDos(userId, updateData) {
    return game.users.get(userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, updateData);
  }
  //DELETE
  static deleteToDo(toDoId) {
    const relevantToDo = this.allToDos[toDoId];

    // Foundry specific syntax required to delete a key from a persisted object in the database
    const keyDeletion = {
      [`-=${toDoId}`]: null
    }

    // update the database with the updated ToDo list
    return game.users.get(relevantToDo.userId)?.setFlag(ToDoList.ID, ToDoList.FLAGS.TODOS, keyDeletion);
  }

}