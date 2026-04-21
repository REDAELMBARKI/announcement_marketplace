import { useEffect, useState } from "react";
import { Product } from "../../types/Product";
import { getMyProducts } from "../services/api";

function MyProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    getMyProducts(token).then(setProducts);
  }, []);

  return (
    <div>
      <h1>My Products</h1>

      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}

export default MyProducts;