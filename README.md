# REST API — Express & Mongoose Checkpoint

A REST API built with **Express** and **Mongoose**, exposing CRUD routes
(`GET`, `POST`, `PUT`, `DELETE`) over a `User` collection stored on
MongoDB Atlas. Routes are tested with **Postman**.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Schema](#user-schema)
- [API Routes](#api-routes)
- [Testing with Postman](#testing-with-postman)
- [Security](#security)

---

## Tech Stack

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| Node.js       | Runtime                         |
| Express       | Web server and routing          |
| Mongoose      | ODM for MongoDB                 |
| Dotenv        | Environment variable management |
| MongoDB Atlas | Hosted database                 |
| Postman       | Manual API testing              |

---

## Project Structure

```
rest-api-checkpoint/
├── config/
│   └── .env          # MONGO_URI (private, never committed)
├── models/
│   └── User.js        # Mongoose schema and model
├── server.js           # Express server and the 4 CRUD routes
├── package.json
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Initialize the project and install dependencies

```bash
npm init -y
npm install express mongoose dotenv
```

### 2. Configure the environment

Create `config/.env`:

```env
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/users_db?retryWrites=true&w=majority"
```

> No spaces around the `=`, and keep the URI inside quotes.

### 3. Run the server

```bash
node server.js
```

Expected console output:

```
Connected to MongoDB Atlas
Server running on http://localhost:3000
```

---

## User Schema

Defined in `models/User.js` using basic Mongoose types:

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: {
    type: Number,
    min: [18, "Minimum age is 18"],
    max: [80, "Maximum age is 80"],
    required: true,
  },
  password: {
    type: String,
    // minlength (not "min") is the correct validator for string length.
    minlength: [8, "Minimum 8 characters"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

---

## API Routes

All routes are defined in `server.js` and prefixed with `/users`.

| Method   | Route        | Description          | Mongoose method            |
| -------- | ------------ | -------------------- | -------------------------- |
| `GET`    | `/users`     | Returns all users    | `User.find()`              |
| `POST`   | `/users`     | Adds a new user      | `User.create()`            |
| `PUT`    | `/users/:id` | Edits a user by ID   | `User.findByIdAndUpdate()` |
| `DELETE` | `/users/:id` | Removes a user by ID | `User.findByIdAndDelete()` |

### GET /users — return all users

```javascript
// Return every user in the database.
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### POST /users — add a new user

```javascript
// Create a user from the request body and save it to the database.
app.post("/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
```

### PUT /users/:id — edit a user by ID

```javascript
// Update the user matching req.params.id with the fields in req.body.
// { new: true } returns the updated document instead of the old one.
app.put("/users/:id", async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ updateUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
```

### DELETE /users/:id — remove a user by ID

```javascript
// Remove the user matching req.params.id.
app.delete("/users/:id", async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", deleteUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
```

---

## Debugging Notes

A few issues were caught and fixed while building this API:

| Bug                                                                                                | File                        | Fix                                                                |
| -------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| `User.create(req, body)` — comma instead of a dot                                                  | `server.js` (POST)          | `User.create(req.body)`                                            |
| `if (!deletedUser)` referenced an undefined variable; the actual result was stored in `deleteUser` | `server.js` (DELETE)        | Renamed the check to `if (!deleteUser)`                            |
| `min: [8, ...]` used on a `String` field                                                           | `models/User.js` (password) | Replaced with `minlength`, the correct validator for string length |

---

## Testing with Postman

1. Start the server: `node server.js`
2. In Postman, create requests against `http://localhost:3000/users`:

| Method | URL           | Body (raw JSON)                                                                         |
| ------ | ------------- | --------------------------------------------------------------------------------------- |
| GET    | `/users`      | —                                                                                       |
| POST   | `/users`      | `{ "name": "Ben Moris", "email": "ben@gmail.com", "age": 26, "password": "secret123" }` |
| PUT    | `/users/<id>` | `{ "age": 27 }`                                                                         |
| DELETE | `/users/<id>` | —                                                                                       |

For `POST` and `PUT`, set the header `Content-Type: application/json`
and select **raw / JSON** as the body type.

3. Copy the `_id` returned by `POST` to test `PUT` and `DELETE` on that
   specific user.

---

## Security

- `config/.env` holds the database credentials and is excluded from
  version control via `.gitignore`.
- Never commit the real `MONGO_URI`. If it is ever pushed by mistake,
  rotate the database user's password in Atlas immediately.

```gitignore
node_modules/
config/.env
package-lock.json
```
