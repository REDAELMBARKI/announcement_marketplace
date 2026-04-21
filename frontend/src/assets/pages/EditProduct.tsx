import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../types/Product";
import { getProduct, updateProduct } from "../services/api";

function EditProduct() {
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (id) {
      getProduct(Number(id)).then((data) => {
        setName(data.name);
        setPrice(String(data.price));
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || "";

    await updateProduct(
      Number(id),
      { name, price: Number(price) },
      token
    );

    alert("Updated!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={price} onChange={(e) => setPrice(e.target.value)} />

      <button>Update</button>
    </form>
  );
}

export default EditProduct;