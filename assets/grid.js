//// Dropdown menu
const dropdownBtn = document.querySelector(".dropdown-btn");
const dropdownMenu = document.querySelector(".dropdown");

dropdownBtn.addEventListener("click", function () {
  if (
    dropdownMenu.classList.contains("open") &&
    dropdownBtn.firstChild.textContent !== "Choose your size"
  ) {
    dropdownBtn.firstChild.textContent = "Choose your size";
  }
  dropdownMenu.classList.toggle("open");
});

//// Overlay
const closeBtn = document.getElementById("close-icon");
const overlay = document.getElementById("overlay");
const productItems = document.querySelectorAll(".product-item");
const productItem = document.querySelector(".item");

closeBtn.addEventListener("click", function () {
  overlay.style.display = "none";
  dropdownMenu.classList.remove("open");
  document.body.classList.remove("no-scroll");
});

overlay.addEventListener("click", function () {
  overlay.style.display = "none";
  document.body.classList.remove("no-scroll");
});

productItem.addEventListener("click", (e) => {
  e.stopPropagation();
});

//// Populate product details

productItems.forEach((item) => {
  item.addEventListener("click", function () {
    const productId = this.dataset.productId;

    fetch(
      `https://peter-sadek-566-teststore.myshopify.com/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            "15f78ce132398cb945772b65293914a4",
        },
        body: JSON.stringify({
          query: `
                query getProduct($id: ID!) {
                    product(id: $id) {
                        title
                        description
                        featuredImage {
                            url
                        }
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        options {
                            name
                            values
                        }
                        variants(first: 10) {
                            edges {
                                node {
                                    selectedOptions {
                                        name
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            `,
          variables: {
            id: `gid://shopify/Product/${productId}`,
          },
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        if (data.errors) {
          console.error("GraphQL Errors:", data.errors);
        } else {
          const product = data.data.product;

          // Update the product details
          document.getElementById("item-title").innerText = product.title;
          document.getElementById("item-description").innerText =
            product.description;

          // Update the product image
          const productImage = document.getElementById("item-image");
          if (product.featuredImage) {
            productImage.src = product.featuredImage.url;
            productImage.style.display = "block";
          } else {
            productImage.style.display = "none";
          }

          // Update the product price
          const productPrice = document.getElementById("item-price");
          if (product.priceRange) {
            productPrice.innerText = `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`;
          }

          // Update the available colors
          const colorOptions = product.options.find(
            (option) => option.name === "Color"
          );
          const colorsContainer = document.getElementById("item-colors");
          colorsContainer.innerHTML = "";
          if (colorOptions) {
            colorsContainer.innerHTML = colorOptions.values
              .map(
                (color) => `
                                <button class="color-picker" style="border-left: 5px solid ${color};">${color}</button>
                            `
              )
              .join("");
            const colorPickers = document.querySelectorAll(".color-picker");
            colorPickers.forEach(function (colorPicker) {
              colorPicker.addEventListener("click", function (e) {
                colorPickers.forEach(function (picker) {
                  picker.classList.remove("selected-color");
                });

                e.target.classList.add("selected-color");
              });
            });
          } else {
            colorsContainer.innerHTML = "No colors available.";
          }

          // Update the available sizes
          const sizeOptions = product.options.find(
            (option) => option.name === "Size"
          );
          const sizesContainer = document.querySelector(".dropdown-content");
          sizesContainer.innerHTML = "";

          if (sizeOptions) {
            sizesContainer.innerHTML = sizeOptions.values
              .map(
                (size) => `
                                <span class="dropdown-item">${size}</span>
                            `
              )
              .join("");

            const items = document.querySelectorAll(".dropdown-item");
            items.forEach((item) => {
              item.addEventListener("click", (e) => {
                e.stopPropagation();
                items.forEach((otherItem) => {
                  otherItem.classList.remove("selected-size");
                });
                e.target.classList.add("selected-size");
                dropdownBtn.firstChild.textContent = item.textContent;
                dropdownMenu.classList.remove("open");
              });
            });
          } else {
            sizesContainer.innerHTML = "No sizes available.";
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    overlay.style.display = "block";
    document.body.classList.add("no-scroll");
  });
});

// Add to cart
document.addEventListener("DOMContentLoaded", function () {
  const addToCartBtn = document.getElementById("addToCartBtn");
  const prodItem = document.querySelector(".product-item");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      const productId = prodItem.getAttribute("data-variant-id");

      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: productId,
          quantity: 1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Item added to cart:", data);
          alert("Item added to cart!");
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
        });
    });
  }
});
