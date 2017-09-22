const express = require('express');
const graphqlHTTP = require('express-graphql');
const fetch = require('node-fetch');
const { buildSchema } = require('graphql');

const app = express();

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
  }

  type Query {
    feed(username: String!): Feed
  }
`);

const root = {
  feed: async ({ username }) =>
    fetch(`https://instagram.com/${username}/media`).then(res => res.json()),
};

app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;

  fetch(`https://instagram.com/${username}/media`)
    .then(data => data.json())
    .then(json => res.json(json));
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    formatError: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack,
      path: error.path,
    }),
  }),
);

app.listen(8080, () => {
  console.log('Listening on port :8080/graphql'); // eslint-disable-line
});
