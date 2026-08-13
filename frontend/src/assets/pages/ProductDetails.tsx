import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../types/Product";
import { getProduct } from "../services/api";
import LoadingScreen from "../../components/Loading/LoadingScreen";

function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (slug) getProduct(slug).then(setProduct);
  }, [slug]);

  if (!product) return <LoadingScreen isLoading={true} variant="spinner" label="Loading product..." />;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.price} DH</p>
      <p>{product.description}</p>
    </div>
  );
}

export default ProductDetails;