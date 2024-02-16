# Vue Twitter App

This project is a full stack app that imitates [Twitter](https://www.twitter.com/). It was made as a University project in 2024.

### Technologies:

* Frontend - Vue.js + Sass
* Backend - NodeJS + Express + Passport.js + Socket.io
* Database - Neo4j

### Functions:

A user can create an account (or log in to an existing one), upon which they are redirected to the home page. They can read posts added by users they follow, respond to them and create new posts. New posts are loaded as the user scrolls down.

Each user can customize their profile picture and a short bio.

The app has a functional notification system that will notify user when one of their followed users adds a new post (via a bell icon with notification count and a small banner showing how many new posts are available).

Posts and users can be found using the search tool and can be followed on their profile page.

### Instructions:

The app expects you to have a Neo4j database running in a Docker container on `neo4j://localhost:7687`. Otherwise it will not work properly.

Navigate to `client`, open console and run `npm run build`. This will create `views` folder in `server`.

Navigate to `server` and run the app by running `npm start` command.

The app will be available on http://localhost:3000.

### Screenshots:

![login](https://github.com/oworob/ug-twitter-vue/blob/main/screenshots/login.png)

![home](https://github.com/oworob/ug-twitter-vue/blob/main/screenshots/home.png)

![post](https://github.com/oworob/ug-twitter-vue/blob/main/screenshots/post.png)

![profile](https://github.com/oworob/ug-twitter-vue/blob/main/screenshots/profile.png)

![search](https://github.com/oworob/ug-twitter-vue/blob/main/screenshots/search.png)
