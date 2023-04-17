# Express JS RESTful API

A simple RESTful API with two major endpoints, `users` and `codes`. It uses MongoDB to store data. After signup/sign in flow, it provides JWT token to the client.

## Installation and Run
```
npm install
npm start
```

## Set correct .env
```
mv .env.example .env
```
Set the correct values

## Project Structure
```
.
├── README.md
├── api
│   ├── middleware
│   │   ├── check-auth.js
│   │   └── query-validator.js
│   ├── models
│   │   ├── code.js
│   │   └── user.js
│   └── routes
│       ├── codes.js
│       └── users.js
├── app.js
├── package-lock.json
├── package.json
└── server.js
```