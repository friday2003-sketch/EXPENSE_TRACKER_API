
const product  = {
  description: "Ride",
  amount: 50000,
  type:"expense",
  category: 'Travel',
  transaction_date:'2026-10-19'
};


// 2. READ — Get all products
async function getProducts() {
  const response = await fetch("http://localhost:3000/transactions?category=Travel");

  const data = await response.json();
  console.log(data);


}

async function getProduct(id) {
  const response = await fetch(`http://localhost:3000/transactions/${id}`);

  const data = await response.json();
  console.log(data);
}

async function summary() {
  const response = await fetch("http://localhost:3000/transactions/summary");

  const data = await response.json();
  console.log(data);
}
summary()


async function addProduct() {

  const response = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  const data = await response.json();
  console.log(data);

}



// 4. UPDATE — Replace all editable fields using PUT
async function replaceProduct(id) {
  const updatedProduct  = {
  description: "Ride",
  amount: 50000,
  type:"expense",
  category: 'Travel',
  transaction_date:'2026-10-19'
};


  const response = await fetch(`http://localhost:3000/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatedProduct)
  });

  const data = await response.json();
  console.log(data);
}


// 5. UPDATE — Change selected fields using PATCH
async function updateProduct(id) {
  const changes = {
    amount: 1500000
  };

  const response = await fetch(`http://localhost:3000/transactions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(changes)
  });

  const data = await response.json();
  console.log(data);
}


// 6. DELETE — Remove a product by ID
async function deleteProduct(id) {
  const response = await fetch(`http://localhost:3000/transactions/${id}`, {
    method: "DELETE"
  });

  const data = await response.json();
  console.log(data);
}


// Choose ONE operation to run at a time:
//getProducts();
 
//addProduct();
 //getProduct(1);
 //replaceProduct(4);
//updateProduct(1);
 //deleteProduct(1);
