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
  
  const id = uuidv4();

  if (userAlreadyExist) {
     return response.status(400).json("User already exist");
  }

  users.push({
    id,
    name,
    username,
    todos: []
  });
  return response.status(200).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const done = false;
  const { title, deadline } = request.body;
  const id = uuidv4();
  user.todos.push({
    id,
    title,
    done,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(200).send();
});

app.put('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.query;

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

app.patch('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.query;

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

app.delete('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.query;

  const { title, deadline } = request.body;

  const findTodo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!findTodo) {
    return response.status(400).json("This Todos don't exist");
  }

  user.todos.splice(findTodo, 1);

  return response.status(200).send();
});

module.exports = app;
