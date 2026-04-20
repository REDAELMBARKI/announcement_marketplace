import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../types/Product";
import { getProduct } from "../services/api";

function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) getProduct(Number(id)).then(setProduct);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.price} DH</p>
      <p>{product.description}</p>
    </div>
  );
}

export default ProductDetails;