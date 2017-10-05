# 02 - GraphQLify!

> 😻 [Motley](https://motley.fi/) Dev Day 22.09.2017 😻

In this lesson we are going pick up from we left off nearly a year ago!
[GraphQL](http://graphql.org/) is the new hotness, but unfortunately
not all services offer GraphQL endpoints... yet! Today we are going
to reflect one of those kind of REST APIs.

> Prerequisites

- Make sure you have completed [01 - NodeJS Microservice with Docker in 30 mins](docs/01_nodejs_microservice_with_docker_in_30mins.md)
- OR check out this repository's `tutorial-2-start` tag and use that as a starting point
- Read up on [GraphQL.org](http://graphql.org/) about GraphQL

## Steps

Let's get started!

## Install dependencies

Let's install some more dependencies. Don't worry, you don't need to know about them
yet!

```bash
npm install express-graphql graphql --save

# or

yarn add express-graphql graphql

# optional: you might have to restart your service quite often, so it might make sense to install `nodemon` which does it automatically for you!

npm install nodemon --save

# or

yarn add nodemon
```

> If you installed `nodemon`, open `package.json` and change `"start": "node index.js"` to `"nodemon index.js"`.

## Getting started with GraphQL

The GraphQL website describes GraphQL as follows:
> GraphQL is a query language for your API, and a server-side runtime for executing queries by using a type system you define for your data. GraphQL isn't tied to any specific database or storage engine and is instead backed by your existing code and data.
>
> A GraphQL service is created by defining types and fields on those types, then providing functions for each field on each type

What this means that we are going to need a `schema` and some `resolvers` for that schema. Confused? Don't worry, it will make tons of sense soon!

Let's open `index.js` again and add the dependencies we just installed!

```diff
const express = require("express");
+const graphqlHTTP = require("express-graphql");
const fetch = require("node-fetch");
+const { buildSchema } = require("graphql");
```

Great! We are going to use the `graphqlHTTP` one to create our `graphql` endpoint. After the existing endpoint, lets add this:

```diff
app.get("/api/user/:username", (req, res) => {
  const { username } = req.params;

  fetch(`https://instagram.com/${username}/media`)
    .then(data => data.json())
    .then(json => res.json(json));
});

+app.use("/graphql", graphqlHTTP({
+  schema,
+  rootValue: root,
+  graphiql: true,
+  formatError: error => ({
+    message: error.message,
+    locations: error.locations,
+    stack: error.stack,
+    path: error.path,
+  }),
+}));
```

It takes an `options` object in, where we define our schema, our root value, enable `graphiql` and format our error messages. But wait, we haven't actually created the schema or the `rootValue` yet (whatever those are!). Lets do this now.

Somewhere before those lines, create some simple placeholders:

``` bash
const schema = buildSchema`
  type User {
    id: String
    username: String
  }
  type Query {
    feed: User
  }
`;
```

In the schema, we define a `query` `feed`, that returns a type called `User`, which consists of an `id` and `username`.

Next we are going to create a `resolver` for it, that actually gives the query the values.

```bash
const root = {
  feed: () => ({ id: '0123456', name: `Katy Perry`})
};
```

Remember the `graphiql` one from the before? Open your browser to `http://localhost:8080/graphql` and `GraphiQL`, a super helpful in-browser tool opens. Here we can test our queries, so lets do just that!

In the left panel, write and run the following query:

```graphql
{
  feed {
    name
  }
}
```

The other panel should show you JSON like this:

``` json
{
  "data": {
    "feed": {
      "name": "Katy Perry"
    }
  }
}
```

Cool! It works, but it's a bit static (...). Let's first make it so that it at least returns the given value.

First we need to add an argument to our query and resolver.

```diff
  type Query {
-   feed: User
+   feed(username: String!): User
  }

...

const root = {
- feed: () => ({ id: '0123456', name: `Katy Perry`})
+ feed: ({ username }) => ({ id: '0123456', name: username})
};
```
The `!` after `String` means that username is mandatory. Now try running a query like this:

```graphql
{
  feed(username: "Katy Perry") {
    name
  }
}
```

## Diving deeper

This is a good start, but lets dive even deeper!

First, lets make our resolver give the actualy results from the Instagram API.

```diff
const root = {
- feed ({ username }) => ({ id: '0123456', name: username})
+ feed: async ({ username }) => fetch(`https://instagram.com/${username}/media`).then(res => res.json()),
};
```

Using `async`, we have a neat one-liner that gives us the responses we need.

Next we need to work on schema. First lets query `http://localhost:8080/api/user/katyperry` to see how the actual responses look like:

```json
{
  "items": [
    {
      "id": "1608501428955181304_407964088",
      "code": "BZSi4cFlPD4",
      "user": {
        "id": "407964088",
        "full_name": "KATY PERRY",
        "profile_picture": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-19\/s150x150\/21107657_1953700014876535_7007316203727224832_a.jpg",
        "username": "katyperry"
      },
      "images": {
        "thumbnail": {
          "width": 150,
          "height": 150,
          "url": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-15\/s150x150\/e35\/21878976_683247951954987_5973114462834524160_n.jpg"
        },
        "low_resolution": {
          "width": 320,
          "height": 320,
          "url": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-15\/s320x320\/e35\/21878976_683247951954987_5973114462834524160_n.jpg"
        },
        "standard_resolution": {
          "width": 640,
          "height": 640,
          "url": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-15\/s640x640\/sh0.08\/e35\/21878976_683247951954987_5973114462834524160_n.jpg"
        }
      },
      "created_time": "1505968334",
      "caption": {
        "id": "17876487136134358",
        "text": "\u2728Firework Finale by @zaldynyc \u2728\ud83d\udcf8by @ronyalwin #witnessthetour",
        "created_time": "1505968334",
        "from": {
          "id": "407964088",
          "full_name": "KATY PERRY",
          "profile_picture": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-19\/s150x150\/21107657_1953700014876535_7007316203727224832_a.jpg",
          "username": "katyperry"
        }
      },
      "likes": {
        "data": [
          {
            "id": "6067558393",
            "full_name": "yasmin dantas",
            "profile_picture": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-19\/s150x150\/21879772_119948888707762_2485877837714685952_n.jpg",
            "username": "yasmindantas981"
          },
          ...
        ],
        "count": 310088
      },
      "comments": {
        "data": [
          {
            "id": "17860363477199151",
            "text": "\u062a\u0643\u0641\u0646\u064a \u0647\u0644 \u0648\u0642\u0641\u0629\u0629\u0629",
            "created_time": "1506022356",
            "from": {
              "id": "1741137334",
              "full_name": "S H A H D . J L A L Y\ud83c\udf43\ud83c\udf38",
              "profile_picture": "https:\/\/scontent-arn2-1.cdninstagram.com\/t51.2885-19\/s150x150\/21819538_132158534188061_8505322138540965888_n.jpg",
              "username": "sh._.hd"
            }
          },
          ...
        ],
        "count": 1846
      },
      "can_view_comments": true,
      "can_delete_comments": false,
      "type": "carousel",
      "link": "https:\/\/www.instagram.com\/p\/BZSi4cFlPD4\/",
      "location": {
        "name": "Montreal Bell Centre"
      },
      "alt_media_url": null,
    },
  ...
  ],
  "more_available": true,
  "status": "ok"
```

Oh right. There's lots of things to do, query there. And we need to do get them all! Good thing that writing the schemas are pretty easy.

Lets start from the top. First off, the resonse to `feed` is a `Feed` that consists of `items`, `more_available` boolean and `status` string.

```diff
- type User {
-   id: String
-   username: String
- }

+# Username's instagram feed
+ type Feed {
+   # List of user items
+   items: [Item]
+   more_available: Boolean
+   status: String
+ }

  type Query {
-   feed: User
+   feed(username: String!): Feed
  }
```

> Braces ([]) mean list of things. There's only a couple of primitives, such as `Int`, `Float`, `Boolean` and `String`! Comments will show up not only
in the schema, but also in GraphiQL!

The type `Item` is a long one, that consists of many things:

```graphql
  type Item {
    id: String,
    code: String
    user: User
    images: ImageType
    created_time: String
    caption: Caption
    likes: Likes
    comments: Comments
    can_view_comments: Boolean
    can_delete_comments: Boolean
    type: String
    link: String
    location: String
    alt_media_url: String
  }
```

Next we need to implement other types too, like User, ImageType, Caption, Likes, Comments and such! If you look at the JSON response, you'll notice that some types are used in many ways! For example `User` type is the same type as the responses for the field `form`.

```graphql
  type Caption {
    id: String
    text: String
    created_time: String
    from: User
  }
  type User {
    id: String
    full_name: String,
    profile_picture: String,
    username: String
  }
```

Start your way from the top and you should end up with something like this:

```js
const schema = buildSchema(`
  type Comment {
    id: String
    text: String
    created_time: String
    from: User
  }
  type Comments {
    data: [Comment]
    count: Int
  }
  type Likes {
    data: [User]
    count: Int
  }
  type Image {
    width: Int
    height: Int
    url: String
  }
  type ImageType {
    thumbnail: Image
    low_resolution: Image
    standard_resolution: Image
  }
  type Caption {
    id: String
    text: String
    created_time: String
    from: User
  }
  type User {
    id: String
    full_name: String,
    profile_picture: String,
    username: String
  }
  type Item {
    id: String,
    code: String
    user: User
    images: ImageType
    created_time: String
    caption: Caption
    likes: Likes
    comments: Comments
    can_view_comments: Boolean
    can_delete_comments: Boolean
    type: String
    link: String
    location: String
    alt_media_url: String
  }

  type Feed {
    items: [Item]
    more_available: Boolean
    status: String
    description: String
  }

  type Query {
    feed(username: String!): Feed
  }
`);
```

Now go to `graphiql` interface and test out some queries. For example, lets get only the names of commenters!

```graphql
{
  feed(username: "katyperry") {
    items {
      comments {
        data {
          from {
            username
          }
        }
      }
    }
  }
}
```

Pretty sweet!

## Next steps

We only scratched the surface what GraphQL can do, so head to (for example) [https://www.howtographql.com/](https://www.howtographql.com/) to learn more!

Oh did you notice that there are some other fields what we didn't actually cover such as `carousel_media`? Try to implement those too!
