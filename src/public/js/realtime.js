const socket = io();
const productsList = document.getElementById("productsList");
const form = document.getElementById("productForm");

// Renderizado dinámico cuando llegan cambios desde WebSocket
socket.on("updateProducts", (products) => {
  productsList.innerHTML = "";

  products.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.title}</strong> - $${p.price}
      <button data-id="${p.id}" class="deleteBtn">Eliminar</button>
    `;
    productsList.appendChild(li);
  });
});

// Crear producto (POST)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const newProduct = {
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    price: parseFloat(formData.get("price")),
    stock: parseFloat(formData.get("stock")),
    category: formData.get("category"),
  };

  await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  });

  form.reset();
});

// Eliminar producto (DELETE)
productsList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.dataset.id;

    await fetch(`/api/products/${id}`, {
      method: "DELETE"
    });
  }
});
