# Members Only

Members Only board built with Node.JS/Express as backend, MongoDB as database, and using Heroku to host it.

Made to practice working with user authentication, cookies, session using PassportJS and data security/safety with bcryptjs.

## Table of contents

- [Members Only](#members-only)
  - [Table of contents](#table-of-contents)
- [Github \& Live](#github--live)
  - [Getting Started](#getting-started)
  - [Deploy](#deploy)
  - [Features](#features)
  - [Status](#status)
  - [Contact](#contact)

# Github & Live

Github repo can be found [here](https://github.com/gizinski-jacek/members-only).

Live demo can be found on [Render](https://members-only-2nbs.onrender.com).

## Getting Started

Install all dependancies by running:

```bash
npm install
```

In the project root directory run the app with:

```bash
npm run devstartcss
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploy

You can easily deploy this app using [Heroku Platform](https://devcenter.heroku.com/articles/git).

Script for running app build after deployment to Heroku is included in package.json.\
In the project root directory run these commands:

```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
heroku create
git push heroku main
heroku open
```

Don't forget to add **.env** file with these environment variables for the app:

```
MONGODB_URI
PASSPORT_SECRET
LEADER_CODE
MEMBER_CODE
```

## Features

- Create and authenticate users
- Create and delete messages

## Status

Project status: **_FINISHED_**

## Contact

Feel free to contact me at:

```
jacektrg@gmail.com
```
