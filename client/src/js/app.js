/* global fetch */
import "../scss/main.scss";
import { createElement } from "./helpers/domHelpers";
import { API_CATEGORIES_LIST } from "./urls";
import { getProductsByCategoryId } from "./urls";
import Product from "./helpers/product";
let selectedCategoryId = null;
const cart = [];
let modal;
import { BASE_URL } from "./urls.js";

async function fetchCategories() {
  const response = await fetch(API_CATEGORIES_LIST);
  const data = await response.json();
  return data;
}

async function fetchProducts(categoryId) {
  if (selectedCategoryId) {
    try {
      const apiUrl = getProductsByCategoryId(selectedCategoryId);
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product data:", error);
      throw error;
    }
  } else {
    console.error("No selected category ID");
  }
}

function renderProducts(products) {
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.textContent = "No products available for this category.";
  } else {
    products.forEach((product) => {
      const productElement = createProductElement(product);
      productsContainer.appendChild(productElement);
    });
  }
}

function openModal(modal) {
  modal.style.display = "block";
}

function closeModal(modal) {
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  modal = createElement("div", null, { class: "modal" });
  const modalContent = createElement("div", null, { class: "modal-content" });
  const closeButton = createElement("span", "&times;", {
    class: "close",
    click: () => closeModal(modal),
  });
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const cartButton = document.getElementById("cartButton");
  if (cartButton) {
    cartButton.addEventListener("click", () => openModal(modal));
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  if (closeButton) {
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeModal(modal);
    });
  }

  modalContent.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-button")) {
      closeModal(modal);
    }
  });
});

async function handleCategoryClick(category) {
  selectedCategoryId = category.id.toLowerCase();

  try {
    const products = await fetchProducts(selectedCategoryId);
    renderProducts(products);
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}

function createProductElement(product) {
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.style.width = "18rem";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  let formattedPrice = "N/A";
  if (typeof product.price === "number") {
    formattedPrice = `$${product.price.toFixed(2)}`;
  }

  const checkboxes = product.toppings.map((topping) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = `topping_${product.id}_${topping.name}`;
    checkbox.value = `${topping.name} ($${topping.price.toFixed(2)})`;
    checkbox.className = "topping-checkbox";
    checkbox.dataset.productId = product.id;
    return checkbox;
  });

  const formattedToppings =
    Array.isArray(product.toppings) && product.toppings.length > 0
      ? checkboxes
          .map((checkbox, index) => {
            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(
              document.createTextNode(
                product.toppings[index].name +
                  ` ($${product.toppings[index].price.toFixed(2)})`
              )
            );
            return label.outerHTML;
          })
          .join("<br/>")
      : "N/A";

  const img = document.createElement("img");
  img.className = "card-img-top product-image";
  img.src = `http://localhost:5000/${product.image}`;
  cardBody.appendChild(img);

  const sizeRadios = product.sizes.map((size, index) => {
    const radio = createElement("input", null, {
      type: "radio",
      name: `${product.id}_size`,
      value: size.name,
      "data-price": size.price,
    });

    const label = document.createElement("label");
    label.htmlFor = `${product.id}_${size.name}`;
    label.appendChild(
      document.createTextNode(`${size.name} (+$${size.price.toFixed(2)})`)
    );

    const radioContainer = document.createElement("div");
    radioContainer.className = "size-radio-container";
    radioContainer.appendChild(radio);
    radioContainer.appendChild(label);

    return radioContainer;
  });

  const sizesContainer = document.createElement("div");
  sizesContainer.className = "sizes-container";
  sizesContainer.appendChild(document.createTextNode("Size: "));

  const smallRadio = sizeRadios.find(
    (radio) => radio.firstChild.value.toLowerCase() === "small"
  );
  if (smallRadio) {
    const radioInput = smallRadio.querySelector("input[type='radio']");
    if (radioInput) {
      radioInput.checked = true;
    }
  }

  sizeRadios.forEach((radioContainer) => {
    sizesContainer.appendChild(radioContainer);
  });

  cardBody.innerHTML += `
    <h5 class="card-title">${product.name}</h5>
    <p class="card-price">Price: ${formattedPrice}</p>
    <p class="card-text">Toppings:<br/>${formattedToppings}</p>
  `;

  cardBody.appendChild(sizesContainer);

  const addToCartButton = createElement("button", "Add to Cart", {
    class: "btn mt-2 btn-cart",
    "data-product-id": product.id,
  });

  cardBody.appendChild(addToCartButton);

  addToCartButton.addEventListener("click", () => {
    const productId = product.id;

    const selectedToppings = Array.from(
      document.querySelectorAll(".topping-checkbox:checked")
    ).map((checkbox) => {
      const [name, price] = checkbox.value.split(" ($");
      return { name, price: parseFloat(price) };
    });

    const selectedSize = document.querySelector(
      `input[name='${product.id}_size']:checked`
    );

    if (selectedSize) {
      const size = {
        name: selectedSize.value,
        price: parseFloat(selectedSize.dataset.price),
      };

      const selectedProduct = new Product(
        product.id,
        product.name,
        product.price,
        product.toppings,
        product.sizes,
        product.image
      );

      selectedProduct.setSelectedToppings(selectedToppings);
      selectedProduct.setSelectedSize(size);

      const totalPrice = selectedProduct.calculateTotalPrice();

      cart.push(selectedProduct);

      updateModal(selectedProduct);
      resetToppingsAndSize(product);
    }
  });

  card.appendChild(cardBody);
  return card;
}

function resetToppingsAndSize(product) {
  const selectedToppingsCheckboxes = document.querySelectorAll(
    `.topping-checkbox[data-product-id='${product.id}']:checked`
  );
  selectedToppingsCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  const selectedSizeRadio = document.querySelector(
    `input[name='${product.id}_size'][value='Small']`
  );
  if (selectedSizeRadio) {
    selectedSizeRadio.checked = true;
  }
}

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("btn-cart")) {
    const productId = event.target.dataset.productId;
    const categoryId = selectedCategoryId;

    try {
      const productData = await getProductDataById(categoryId, productId);
      if (productData && productData.name) {
      } else {
        console.error("Invalid product data:", productData);
        alert("Error: Invalid product data. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      alert(
        "Error: Unable to fetch product data. Please check your network connection and try again later."
      );
    }
  }
});

function updateModal() {
  const modalContent = document.querySelector(".modal-content");

  modalContent.innerHTML = "";

  const closeButton = createElement("span", "&times;", {
    class: "close",
  });
  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeModal(modal);
  });
  modalContent.appendChild(closeButton);

  const totalPrice = cart.reduce((total, product) => {
    return total + product.calculateTotalPrice();
  }, 0);

  const totalPriceElement = createElement(
    "div",
    `Total Price of your order: $${totalPrice.toFixed(2)}`,
    {
      class: "total-price",
    }
  );
  modalContent.appendChild(totalPriceElement);

  cart.forEach((selectedProduct) => {
    const productName = createElement(
      "div",
      `Name: ${selectedProduct.getName()}`
    );
    const toppingsString =
      selectedProduct.selectedToppings.length > 0
        ? `Toppings: ${selectedProduct.getToppingsString()}`
        : "No Toppings";
    const size = createElement(
      "div",
      `Size: ${selectedProduct.getSelectedSize().name}`
    );
    const totalPrice = createElement(
      "div",
      `Total Price: ${selectedProduct.calculateTotalPrice().toFixed(2)}`
    );
    const productInfoContainer = createElement("div", null, {
      class: "product-info",
    });
    productInfoContainer.appendChild(productName);
    productInfoContainer.appendChild(createElement("div", toppingsString));
    productInfoContainer.appendChild(size);
    productInfoContainer.appendChild(totalPrice);

    const removeButton = createElement("button", "Remove", {
      class: "btn btn-danger remove-btn",
    });

    removeButton.addEventListener("click", () => {
      const productIndex = cart.findIndex(
        (product) => product.id === selectedProduct.id
      );
      if (productIndex !== -1) {
        cart.splice(productIndex, 1);
        updateModal();
      }
    });

    productInfoContainer.appendChild(removeButton);
    modalContent.appendChild(productInfoContainer);
  });

  const orderButton = createElement("button", "Order", {
    class: "btn btn-primary order-btn",
  });

  orderButton.style.display = cart.length > 0 ? "block" : "none";

  orderButton.addEventListener("click", () => {
    const orderData = {
      products: cart.map((product) => {
        return {
          id: product.id,
          name: product.getName(),
          toppings: product.getToppingsString(),
          size: product.getSelectedSize().name,
          totalPrice: product.calculateTotalPrice().toFixed(2),
        };
      }),
      totalPrice: cart
        .reduce((total, product) => total + product.calculateTotalPrice(), 0)
        .toFixed(2),
    };

    fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order placed successfully!", data);
        cart.length = 0;
        updateModal();
        closeModal(modal);
      })
      .catch((error) => {
        console.error("Error placing order:", error);
      });
  });

  modalContent.appendChild(orderButton);
  modal.style.display = "block";
}

async function getProductDataById(categoryId, productId) {
  try {
    const response = await fetch(
      `${BASE_URL}/products/${categoryId}/${productId}`
    );
    if (!response.ok) {
      console.error("Error fetching product data:", response.status);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.name) {
      return data;
    } else {
      console.error("Invalid product data:", data);
      throw new Error("Invalid product data");
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error;
  }
}

async function createCategoryPage() {
  const categoriesData = await fetchCategories();

  if (categoriesData && categoriesData.length > 0) {
    const mainBlock = createElement(
      "div",
      null,
      { class: "main-block" },
      null,
      document.body
    );

    const containerDiv = createElement(
      "div",
      null,
      { class: "container mt-5 blur" },
      null,
      mainBlock
    );

    const productsContainer = createElement(
      "div",
      null,
      { id: "productsContainer", class: "productsContainer" },
      null,
      mainBlock
    );

    const rowDiv = createElement(
      "div",
      null,
      { class: "row" },
      null,
      containerDiv
    );

    categoriesData.forEach((category) => {
      const colDiv = createElement(
        "div",
        null,
        { class: "col-md-3 text-center rounded category-block" },
        null,
        rowDiv
      );

      const imgPath = `./img/${category.name.toLowerCase()}/${category.name.toLowerCase()}.jpg`;
      createElement(
        "img",
        null,
        {
          class: "img-fluid rounded-circle mb-4 circular-image",
          src: imgPath,
          alt: `${category.name} Image`,
        },
        null,
        colDiv
      );

      const categoryButton = createElement(
        "button",
        category.name,
        {
          class:
            "btn btn-primary category-button category-name open-modal-button",
        },
        null,
        colDiv,
        { productId: category.id }
      );
      categoryButton.addEventListener("click", () =>
        handleCategoryClick(category)
      );
    });
  }
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("topping-checkbox")) {
    const selectedToppings = Array.from(
      document.querySelectorAll(".topping-checkbox:checked")
    ).map((checkbox) => checkbox.value);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await createCategoryPage();
});
