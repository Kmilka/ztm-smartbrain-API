# SmartBrain App backend

SmartBrain is a pet project I used to learn how to code. Backend running on **Node.js** with **Express.js** framework at the base. Databases used: **Postgres** for user data and **Redis** for session management. App is **dockerized** and deployed to **Heroku**.

### Information on github branches

**Branch named _github_:**

`docker-compose up --build`
Downloads all required Docker images and runs the app (and all needed containers) in the development mode.
Check Docker docs on how to use `docker-compose` [here](https://docs.docker.com/compose/reference/up/).
Environment variables are in the _.env_ file, which is not commited to Github.

**Branch named _master_:**

This branch is connected to Heroku server and every commit is auto-deployed there.
Environment variables are configured using `heroku config:set`. Check Heroku docs on how to manage apps [here](https://devcenter.heroku.com/categories/reference).

### Third-party libraries

Except for mentioned above development libraries the core tech library is **Clarifai** _face detection_. It's an AI-based App, which detects human faces on pictures. Read more about it [here](https://www.clarifai.com/models/face-detection).
