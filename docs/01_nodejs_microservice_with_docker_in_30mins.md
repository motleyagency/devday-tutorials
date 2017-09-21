# NodeJS Microservice with Docker in 30 mins
> 😻 [Motley](https://motley.fi/) Dev Day 14.10.2016 😻

Contents of this document were written on the fly on [Motley](https://motley.fi)
development day, demonstrating how to build [`NodeJS`](https://nodejs.org) 
microservices with Express running inside a [`Docker`](https://www.docker.com/) container.

The 30 minutes included:
  - Installing `NodeJS`
  - Installing dependencies
  - Creating an [`Express` app](http://expressjs.com/) that
    - creates an server listening on `8080`.
    - creates an endpoint `/api/user/:username` that [fetches](https://github.com/bitinn/node-fetch) 
    users [Instagram](https://instagram.com) feed.
  - Adding a `Dockerfile` that builds and runs the `NodeJS` app.
  - Deploying the app to [`zeit.co`](https://zeit.co)
  
## Prerequisites

- [NodeJS](https://nodejs.org/en/download/) v6.x.x or newer
  - If you have [`Homebrew`](http://brew.sh) installed, you can just do `brew update && brew install node`.
- Docker installed, for macOS we recommend [Docker for Mac](https://download.docker.com/mac/stable/Docker.dmg), for Windows [Docker for Windows](https://download.docker.com/win/stable/InstallDocker.msi) and on other *nix platforms you know what to do!

## Steps

These are the step-by-step guidelines we ran through while making this doc.

### Installing dependencies

We begin by creating a `package.json` with `npm init`. The resulting `json` file
looks something like this:

``` json
{
  "name": "node-microservice-with-docker-in-30mins",
  "version": "1.0.0",
  "description": "NodeJS Microservice with Docker in 30 minutes",
  "main": "index.js",
  "repository": "https://github.com/motleyagency/node-microservice-with-docker-in-30mins",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Pete Nykänen <pete.a.nykanen@gmail.com>",
  "license": "MIT",
  "private": true
}
```

Next we install some dependencies. For this you can use `Yarn` or `npm`, the
choice is yours!

> Don't have [Yarn](https://yarnpkg.com) yet? See [https://yarnpkg.com/lang/en/docs/install/](https://yarnpkg.com/lang/en/docs/install/)

We are going to need the following packages: `express` and `node-fetch`.
``` bash
# install dependencies 
npm install express node-fetch

# or

yarn add express node-fetch

# optionally install our `eslint` config that might help you write some beautiful code!
(
  export PKG=eslint-config-motley
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

The packages are now in the `package.json`s `dependencies` field.

### Creating the app

The app is rather simple: we create a server with `Express` that has a single
endpoint `/api/user/:username`. When a `GET` request reaches that endpoint,
we go and fetch the given `username`s `json` feed from Instagram and send it
back as an response.

``` js
const express = require("express"); // require express
const fetch = require("node-fetch"); // require node-fetch 

const app = express(); // initialize express app

app.get("/api/user/:username", (req, res) => { // set up the endpoint
  const { username } = req.params; // extract username from the request parameters

  fetch(`https://instagram.com/${username}/media`) // fetch the data from Instagram
    .then(data => data.json()) // convert to json
    .then(json => res.json(json)); // send the json as a response
});

app.listen(8080, () => { // listen to request at port 8080
  console.log("Listening on port 8080"); // eslint-disable-line -- and log that the server is on
});
```

We can now run the server with `node index.js`:

``` bash
node index.js
Listening on port 8080
```

Navigating to [`http://localhost:8080/api/user/katyperry`](http://localhost:8080/api/user/katyperry)
should show Katy Perry's public feed as JSON.

For ease of use, we also alias this as `npm start` command.

Add the following to `package.json`.

``` json
"scripts": {
  "start": "node index.js"
},
```

Now we can run the server just with `npm start`!

### Creating a Dockerfile

The `Dockerfile` is equally simple. We take the `node:latest` base image,
copy some files in, install dependencies, expose a port and run 
the start command. Create a file called `Dockerfile` to the root of your project
and add the following set of commands to that file:

``` Dockerfile
FROM node:latest # Using the latest NodeJS image...

LABEL name="node-microservice-with-docker-in-30mins" # name label for our image

WORKDIR /tmp # set the working directory to /tmp
COPY ./package.json package.json # copy the package.json file
COPY ./index.js index.js # copy the index.js file

RUN npm install # install dependencies

EXPOSE 8080 # expose the port

CMD ["node", "index.js"] # run the index.js file
```

Now we can build the image with `docker build`:

``` bash
docker build -t devday .
```

and then run it with `docker run`

```
docker run -it -p 8080:8080 devday
```

and you should again see Katy Perry's public feed as JSON at [`http://localhost:8080/api/user/katyperry`](http://localhost:8080/api/user/katyperry).

### Publishing to [`zeit.co`](https://zeit.co)

`zeit.co` is a service we can use to simply deploy our small app.

First lets install the `now` command line utility via `yarn`.

``` bash
yarn global add now
```

Now we can just run `now`. You'll get prompted for an email address and you'll
need to login via the email sent to you. You'll need to pick up either the `Dockerfile`
or the `package.json`. As we set up the `npm start` script we can run either, but lets
pick up the `Dockerfile` with 2.

``` bash
now
> Enter your email: your.email@host.com
> Please follow the link sent to your.email@host.com to log in.
> Waiting for confirmation....
> Two manifests found. Press [n] to deploy or re-run with --flag
> [1] package.json	   --npm
> [2] Dockerfile	--docker
>
> Using Node.js x.x.x (default)
> Ready! https://node-microservice-with-docker-in-30mins-randomlettershere.now.sh (copied to clipboard) [56s]
> Upload [====================] 100%
> Sync complete (5.62kB) [2s]
> Initializing…
> Building
> ▲ docker build
> Step 6 : EXPOSE 8080
> Removing intermediate container 72f09ed83789
>  ---> Running in 124970f331de
>  ---> 9a523ee45e22
> Removing intermediate container 124970f331de
> Step 7 : CMD node index.js
>  ---> Running in 2773a7ee2e5e
>  ---> 3d599ef7feea
> Removing intermediate container 2773a7ee2e5e
> Successfully built 3d599ef7feea
> ▲ Storing image
> ▲ Deploying image
> ▲ Container started
> Listening on port 8080

```

And finally you should once again see Katy Perry's public feed at 
`https://node-microservice-with-docker-in-30mins-randomlettershere.now.sh/api/user/katyperry`!