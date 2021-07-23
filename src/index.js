const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json("error: user don't fund");
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some(
    (user) => user.username === username
  );
  
  if (userAlreadyExist) {
     return response.status(400).json("User already exist");
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  
  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { title, deadline } = request.body;

  const findTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!findTodo) {
    return response.status(400).json("This Todos don't exist");
  }

  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.status(200).send();

});

app.patch('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { title, deadline } = request.body;

  const findTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!findTodo) {
    return response.status(400).json("This Todos don't exist");
  }

  findTodo.done = true;

  return response.status(200).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!findTodo) {
    return response.status(400).json("This Todos don't exist");
  }

  const todoIndex = user.todos.indexOf(findTodo);

  user.todos.splice(todoIndex, 1);

  return response.status(200).send();
});

module.exports = app;
