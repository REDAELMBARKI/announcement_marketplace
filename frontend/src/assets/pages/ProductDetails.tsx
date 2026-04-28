import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../types/Product";
import { getProduct } from "../services/api";

function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (slug) getProduct(slug).then(setProduct);
  }, [slug]);

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