const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    "<h1>Hello from Node.js on Render!</h1><p>Templify is coming soon...</p>"
  );
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
