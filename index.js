const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/api/user/:username", (req, res) => {
  const { username } = req.params;

  fetch(`https://instagram.com/${username}/media`)
    .then(data => data.json())
    .then(json => res.json(json));
});

app.listen(8080, () => {
  console.log("Listening on port 8080"); // eslint-disable-line
});
