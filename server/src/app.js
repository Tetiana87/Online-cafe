const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const categories = require("./data/categories.json");
const products = require("./data/products.json");
require("dotenv").config();
const http = require("http");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

app.get("/api/categories", function (request, response) {
  response.status(200).send(categories);
});

app.get("/api/products/:category/:id", function (request, response) {
  const categoryId = request.params.category.toLowerCase();
  const productId = parseInt(request.params.id);
  const category = products.categories.find((cat) => cat.id === categoryId);

  if (category) {
    const product = category.products.find((prod) => prod.id === productId);

    if (product) {
      response.status(200).json(product);
    } else {
      response.status(404).send("Product not found");
    }
  } else {
    response.status(404).send("Category not found");
  }
});

app.get("/api/products/:category", function (request, response) {
  const categoryId = request.params.category; // Do not convert to lowercase
  const category = products.categories.find((cat) => cat.id === categoryId);

  if (category) {
    const productsByCategory = products[category.id] || [];
    response.status(200).send(category.products);
  } else {
    response.status(404).send("Category not found");
  }
});

app.post("/api/orders", function (request, response) {
  const orderData = request.body;

  console.log("Received Order:", orderData);

  response.status(200).json({ message: "Order placed successfully!" });
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
