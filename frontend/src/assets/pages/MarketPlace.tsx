

import { useEffect, useState } from "react";
import { Product } from "../../types/Product";
import { getProducts } from "../services/api";

function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div>
      <h1>Marketplace</h1>

      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.price} DH</p>
        </div>
      ))}
    </div>
  );
}

export default Marketplace;