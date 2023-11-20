class Product {
  constructor(id, name, price, toppings, sizes, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.toppings = toppings;
    this.sizes = sizes;
    this.image = image;
    this.selectedToppings = [];
    this.selectedSize = null;
  }

  setSelectedToppings(toppings) {
    this.selectedToppings = toppings;
  }

  setSelectedSize(size) {
    this.selectedSize = size;
  }

  getName() {
    return this.name;
  }

  getToppingsString() {
    return this.selectedToppings.map((topping) => topping.name).join(", ");
  }

  getSelectedSize() {
    return this.selectedSize;
  }

  calculateTotalPrice() {
    const toppingsPrice = this.selectedToppings.reduce(
      (total, topping) => total + topping.price,
      0
    );
    const sizePrice = this.selectedSize ? this.selectedSize.price : 0;
    return this.price + toppingsPrice + sizePrice;
  }

  getInfo() {
    return `
      ${this.getName()}
      Toppings: ${this.getToppingsString()}
      Size: ${this.getSelectedSize().name}
      Total Price: $${this.calculateTotalPrice().toFixed(2)}
    `;
  }
}

export default Product;
