import express from "express";
import { router as apiRoutes } from "./src/routes/api.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

app.use("/api", apiRoutes);
app.get("/", (req, res) => res.json({ message: "Welcome to Templify!" }));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
