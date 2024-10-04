document.addEventListener("DOMContentLoaded", () => {
    const jsonUrl = "http://localhost:3000";
    let products = [];
    let cart = [];

    const cartModal = document.getElementById("cart-modal");
    const openCartBtn = document.getElementById("open-cart-btn");
    const closeModalBtn = document.getElementById("close-modal");

    fetch(`${jsonUrl}/products`)
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
            loadCategories();
            setupFilters();
            loadCart();
        })
        .catch(error => console.error("Error al cargar los productos:", error));

    function loadCart() {
        fetch(`${jsonUrl}/cart`)
            .then(response => response.json())
            .then(data => {
                cart = data;
                updateCartItems();
            })
            .catch(error => console.error("Error al cargar el carrito:", error));
    }

    function displayProducts(productList) {
        const productListElement = document.getElementById("product-list");
        productListElement.innerHTML = "";

        productList.forEach(product => {
            const productElement = document.createElement("div");
            productElement.classList.add("bg-white", "p-4", "rounded-lg", "shadow-md", "hover:shadow-lg", "transition", "duration-300");

            productElement.innerHTML = `
                <img src="${product.img}" alt="${product.name}" class="w-full h-48 object-cover rounded-t-lg">
                <h3 class="text-lg font-semibold mt-2">${product.name}</h3>
                <p class="text-gray-700">Precio: $${product.price}</p>
                <p class="text-gray-600">${product.description}</p>
                <button onclick="addToCart(${product.id})" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Agregar al Carrito</button>
            `;

            productListElement.appendChild(productElement);
        });
    }

    function loadCategories() {
        const categories = [
            { categori_id: 1, name: "drinks" },
            { categori_id: 2, name: "lunch" },
            { categori_id: 3, name: "food" },
            { categori_id: 4, name: "sea" }
        ];

        const categoryFilter = document.getElementById("category-filter");
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.categori_id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

    function setupFilters() {
        const categoryFilter = document.getElementById("category-filter");
        const availabilityFilter = document.getElementById("availability-filter");
        const priceFilter = document.getElementById("price-filter");
        const sortFilter = document.getElementById("sort-filter");
        const searchBar = document.getElementById("search-bar");

        categoryFilter.addEventListener("change", applyFilters);
        availabilityFilter.addEventListener("change", applyFilters);
        priceFilter.addEventListener("change", applyFilters);
        sortFilter.addEventListener("change", applyFilters);
        searchBar.addEventListener("input", applyFilters);
    }

    function applyFilters() {
        const categoryFilter = document.getElementById("category-filter").value;
        const availabilityFilter = document.getElementById("availability-filter").value;
        const priceFilter = document.getElementById("price-filter").value;
        const sortFilter = document.getElementById("sort-filter").value;
        const searchBar = document.getElementById("search-bar").value.toLowerCase();

        let filteredProducts = products;

        if (categoryFilter) {
            filteredProducts = filterByCategory(filteredProducts, categoryFilter);
        }

        if (availabilityFilter) {
            filteredProducts = filterByAvailability(filteredProducts, availabilityFilter);
        }

        if (priceFilter) {
            filteredProducts = filterByPrice(filteredProducts, priceFilter);
        }

        if (searchBar) {
            filteredProducts = searchProducts(filteredProducts, searchBar);
        }

        if (sortFilter) {
            filteredProducts = sortProducts(filteredProducts, sortFilter);
        }

        displayProducts(filteredProducts);
    }

    function filterByCategory(products, categoryId) {
        return products.filter(product => product.categories.includes(parseInt(categoryId)));
    }

    function filterByAvailability(products, filter) {
        if (filter === "available") {
            return products.filter(product => product.available);
        } else if (filter === "soldout") {
            return products.filter(product => !product.available);
        } else if (filter === "bestseller") {
            return products.filter(product => product.best_seller);
        }
        return products;
    }

    function filterByPrice(products, priceFilter) {
        const priceConversion = product => parseFloat(product.price.replace(".", ""));
        if (priceFilter === "lt10000") {
            return products.filter(product => priceConversion(product) < 10000);
        } else if (priceFilter === "gt30000") {
            return products.filter(product => priceConversion(product) > 30000);
        }
        return products;
    }

    function searchProducts(products, query) {
        return products.filter(product => product.name.toLowerCase().includes(query));
    }

    function sortProducts(products, sortBy) {
        if (sortBy === "name") {
            return products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "price-asc") {
            return products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === "price-desc") {
            return products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        return products;
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            cart.push(product);
            alert(`${product.name} ha sido agregado al carrito.`);
            updateCartItems();
        }
    };

    openCartBtn.addEventListener("click", () => {
        cartModal.classList.remove("hidden");
        updateCartItems();
    });

    closeModalBtn.addEventListener("click", () => {
        cartModal.classList.add("hidden");
    });

    window.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            cartModal.classList.add("hidden");
        }
    });

    function updateCartItems() {
        const cartItemsElement = document.getElementById("cart-items");
        cartItemsElement.innerHTML = "";

        if (cart.length === 0) {
            cartItemsElement.innerHTML = "<p>El carrito está vacío.</p>";
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("flex", "justify-between", "items-center", "mb-2");
                itemElement.innerHTML = `${item.name} - $${item.price}`;
                cartItemsElement.appendChild(itemElement);
            });
        }
    }

    document.getElementById("clear-cart").addEventListener("click", () => {
        cart = [];
        updateCartItems();
        alert("El carrito ha sido vaciado.");
    });
});

