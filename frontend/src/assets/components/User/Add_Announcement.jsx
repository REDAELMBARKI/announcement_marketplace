import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  BookOpen,
  Camera,
  Image,
  MapPinned,
  Palette,
  Ruler,
  Shapes,
  Tag,
  Footprints,
  HandHeart,
  Heart,
  MapPin,
  Package,
  Plus,
  Shirt,
  ToyBrick,
  Truck,
  X,
} from "lucide-react";
import {
  Field,
  IconCardButton,
  PillButton,
  SelectInput,
  Stepper,
  TextArea,
  TextInput,
} from "./announcement/Shared.jsx";
import "../../../css/add_announcement.css";

const BASE_STEPS = [
  { key: "category", label: "Categorie" },
  { key: "product", label: "Produit & Media" },
  { key: "variants", label: "Variantes" },
  { key: "price", label: "Prix" },
  { key: "location", label: "Localisation" },
];

const CATEGORIES = [
  { label: "Vetements", icon: Shirt },
  { label: "Chaussures", icon: Footprints },
  { label: "Jouets", icon: ToyBrick },
  { label: "Puericulture", icon: Baby },
  { label: "Livres & Eveil", icon: BookOpen },
  { label: "Autre", icon: Package },
];
const COLORS = ["Rouge", "Bleu", "Vert", "Jaune", "Rose", "Blanc", "Noir", "Multi"];
const SIZES = ["3M", "6M", "12M", "18M", "2A", "3A", "4A", "5A", "6A", "8A", "10A", "12A"];
const MATERIALS = ["Coton", "Laine", "Polyester", "Denim", "Cuir", "Synthetique"];

export default function Add_Announcement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fileInputRef = useRef(null);

  const [stepKey, setStepKey] = useState("category");
  const [status, setStatus] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [form, setForm] = useState({
    category: "Vetements",
    item_name: "",
    description: "",
    is_collection: false,
    gender: "",
    recommended_age: "",
    brand: "",
    condition: "",
    sizes: [],
    colors: [],
    material: "",
    quantity: 1,
    season: "",
    listing_type: "donation",
    price: "",
    negotiable: false,
    is_fixed_price: false,
    pickup_city: "",
    pickup_district: "",
    handover_method: "both",
    pickup_address: "",
    charity_ID: 1,
  });

  const visibleSteps = useMemo(() => BASE_STEPS, []);
  const mainPhoto = photos[mainPhotoIndex] || photos[0] || null;

  const stepIndex = visibleSteps.findIndex((step) => step.key === stepKey);
  const currentStepNumber = stepIndex + 1;
  const isLastStep = currentStepNumber === visibleSteps.length;

  const canPublish = useMemo(() => {
    return (
      form.item_name.trim() &&
      form.description.trim() &&
      form.condition &&
      form.pickup_city.trim() &&
      form.handover_method
    );
  }, [form]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const clearFieldError = (key) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const updateFieldWithValidation = (key, value) => {
    updateField(key, value);
    clearFieldError(key);
  };

  const toggleItem = (key, value) => {
    setForm((prev) => {
      const selected = prev[key];
      return {
        ...prev,
        [key]: selected.includes(value)
          ? selected.filter((entry) => entry !== value)
          : [...selected, value],
      };
    });
    clearFieldError(key);
  };

  const validateStep = (targetStepKey = stepKey) => {
    const errors = {};
    if (targetStepKey === "category" && !form.category) {
      errors.category = "Choisissez une categorie.";
    }
    if (targetStepKey === "product") {
      if (!form.item_name.trim()) errors.item_name = "Le titre est obligatoire.";
      if (!form.description.trim()) errors.description = "La description est obligatoire.";
      if (!form.condition) errors.condition = "Choisissez l'etat du produit.";
      if (!photos.length) errors.photos = "Ajoutez au moins une photo.";
    }
    if (targetStepKey === "variants" && !form.is_collection) {
      if (!form.sizes.length) errors.sizes = "Selectionnez au moins une taille.";
      if (!form.colors.length) errors.colors = "Selectionnez au moins une couleur.";
      if (!form.material) errors.material = "Selectionnez une matiere.";
      if (!form.quantity || Number(form.quantity) < 1) errors.quantity = "Quantite minimum: 1.";
      if (!form.season) errors.season = "Choisissez une saison.";
    }
    if (targetStepKey === "price" && form.listing_type === "sale" && !String(form.price).trim()) {
      errors.price = "Le prix est obligatoire pour une vente.";
    }
    if (targetStepKey === "location") {
      if (!form.pickup_city.trim()) errors.pickup_city = "La ville est obligatoire.";
      if (!form.handover_method) errors.handover_method = "Choisissez un mode de remise.";
    }
    return errors;
  };

  const goNext = () => {
    const current = visibleSteps[stepIndex];
    const errors = validateStep(current?.key);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus({ type: "error", message: "Veuillez corriger les erreurs en rouge." });
      return;
    }
    setFieldErrors({});
    setStatus(null);
    const nextKey = visibleSteps[stepIndex + 1]?.key;
    if (nextKey) {
      setStepKey(nextKey);
    }
  };

  const goPrev = () => {
    setStatus(null);
    setFieldErrors({});
    const previousKey = visibleSteps[stepIndex - 1]?.key;
    if (previousKey) {
      setStepKey(previousKey);
    }
  };

  const onPhotoChange = (event) => {
    const incoming = Array.from(event.target.files || []);
    const merged = [...photos, ...incoming].slice(0, 8);
    setPhotos(merged);
    if (mainPhotoIndex >= merged.length) {
      setMainPhotoIndex(0);
    }
    clearFieldError("photos");
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
    setMainPhotoIndex((prevIndex) => {
      if (indexToRemove === prevIndex) {
        return 0;
      }
      if (indexToRemove < prevIndex) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const submitAnnouncement = async () => {
    if (!user?.donor?.donor_ID) {
      setStatus({ type: "error", message: "Connectez-vous d'abord." });
      return;
    }

    const submitErrors = validateStep("location");
    if (Object.keys(submitErrors).length) {
      setFieldErrors(submitErrors);
      setStatus({ type: "error", message: "Veuillez corriger les erreurs avant publication." });
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else {
        formData.append(key, value);
      }
    });
    formData.append("donor_ID", user.donor.donor_ID);
    formData.append("currency", "MAD");
    formData.append("primary_photo_index", String(mainPhotoIndex));
    formData.append("size", form.sizes[0] || "");
    formData.append("condition", form.condition || "bon");
    photos.forEach((photo) => formData.append("photos[]", photo));
    if (photos[0]) {
      formData.append("image", photos[0]);
    }

    try {
      const response = await fetch("http://localhost:8000/api/announcements", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const payload = await response.json();
      if (payload.status === "success") {
        setStatus({ type: "success", message: "Annonce publiee avec succes." });
        setTimeout(() => navigate("/my_donations"), 1200);
        return;
      }
      setStatus({ type: "error", message: payload.message || "Erreur de validation." });
    } catch (error) {
      setStatus({ type: "error", message: "Erreur reseau." });
    }
  };

  const renderStep = () => {
    if (stepKey === "category") {
      return (
        <>
          <h3>Qu’annoncez-vous aujourd’hui ?</h3>
          <p className="subtitle">Selectionnez une categorie principale.</p>
          {fieldErrors.category ? <p className="aa-error-text">{fieldErrors.category}</p> : null}
          <div className="aa-icon-grid">
            {CATEGORIES.map(({ label, icon }) => (
              <IconCardButton
                key={label}
                icon={icon}
                title={label}
                active={form.category === label}
                onClick={() => updateFieldWithValidation("category", label)}
              />
            ))}
          </div>
        </>
      );
    }

    if (stepKey === "product") {
      return (
        <>
          <h3>Media & Details produit</h3>
          <div className="aa-media-uploader">
            <div className="aa-photos-row">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${index}`} className={`aa-thumb ${index === 0 ? "main" : ""}`}>
                  {index === 0 ? <span className="aa-main-tag">Principale</span> : null}
                  <button type="button" className="aa-thumb-delete" onClick={() => removePhoto(index)}>
                    <X size={14} />
                  </button>
                  <img src={URL.createObjectURL(photo)} alt={photo.name} />
                </div>
              ))}

              {photos.length < 8 ? (
                <button
                  type="button"
                  className="aa-ghost-uploader"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={18} />
                  <Plus size={14} />
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="aa-hidden-input"
              onChange={onPhotoChange}
            />
          </div>
          {fieldErrors.photos ? <p className="aa-error-text">{fieldErrors.photos}</p> : null}
          <div className="aa-two-col">
            <Field label="Titre de l'annonce">
              <TextInput
                value={form.item_name}
                placeholder="Ex : Manteau chaud garcon 4 ans"
                onChange={(e) => updateFieldWithValidation("item_name", e.target.value)}
              />
              {fieldErrors.item_name ? <p className="aa-error-text">{fieldErrors.item_name}</p> : null}
            </Field>
            <Field label="Marque">
              <TextInput
                value={form.brand}
                placeholder="Zara Kids, H&M, Kiabi, Sans marque..."
                onChange={(e) => updateFieldWithValidation("brand", e.target.value)}
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={form.description}
                placeholder="Details supplementaires..."
                onChange={(e) => updateFieldWithValidation("description", e.target.value)}
              />
              {fieldErrors.description ? <p className="aa-error-text">{fieldErrors.description}</p> : null}
            </Field>
            <Field label="Genre">
              <SelectInput
                value={form.gender}
                onChange={(e) => updateFieldWithValidation("gender", e.target.value)}
                options={[
                  { label: "— Choisir —", value: "" },
                  { label: "Garcon", value: "garcon" },
                  { label: "Fille", value: "fille" },
                  { label: "Unisexe", value: "unisexe" },
                ]}
              />
            </Field>
            <Field label="Age recommande">
              <SelectInput
                value={form.recommended_age}
                onChange={(e) => updateFieldWithValidation("recommended_age", e.target.value)}
                options={[
                  { label: "— Choisir —", value: "" },
                  { label: "0-2 ans", value: "0-2 ans" },
                  { label: "3-5 ans", value: "3-5 ans" },
                  { label: "6-8 ans", value: "6-8 ans" },
                  { label: "9-12 ans", value: "9-12 ans" },
                ]}
              />
            </Field>
          </div>
          <div className="aa-pills-wrap">
            {["Neuf avec etiquettes", "Tres bon etat", "Bon etat", "Etat correct"].map((value) => (
              <PillButton
                key={value}
                active={form.condition === value}
                onClick={() => updateFieldWithValidation("condition", value)}
              >
                {value}
              </PillButton>
            ))}
          </div>
          {fieldErrors.condition ? <p className="aa-error-text">{fieldErrors.condition}</p> : null}
        </>
      );
    }

    if (stepKey === "variants") {
      return (
        <>
          <h3>Tailles & Variantes</h3>
          <label className="aa-collection-toggle">
            <input
              type="checkbox"
              checked={form.is_collection}
              onChange={(e) => updateField("is_collection", e.target.checked)}
            />
            C'est un lot / collection
          </label>
          {!form.is_collection ? (
            <>
              <div className="aa-pills-wrap">
                {SIZES.map((size) => (
                  <PillButton key={size} active={form.sizes.includes(size)} onClick={() => toggleItem("sizes", size)}>
                    {size}
                  </PillButton>
                ))}
              </div>
              {fieldErrors.sizes ? <p className="aa-error-text">{fieldErrors.sizes}</p> : null}
              <div className="aa-pills-wrap">
                {COLORS.map((color) => (
                  <PillButton key={color} active={form.colors.includes(color)} onClick={() => toggleItem("colors", color)}>
                    <span className={`aa-color-dot ${color.toLowerCase().replace(/\s+/g, "-")}`} />
                    {color}
                  </PillButton>
                ))}
              </div>
              {fieldErrors.colors ? <p className="aa-error-text">{fieldErrors.colors}</p> : null}
              <div className="aa-pills-wrap">
                {MATERIALS.map((material) => (
                  <PillButton
                    key={material}
                    active={form.material === material}
                    onClick={() => updateFieldWithValidation("material", material)}
                  >
                    {material}
                  </PillButton>
                ))}
              </div>
              {fieldErrors.material ? <p className="aa-error-text">{fieldErrors.material}</p> : null}
              <div className="aa-two-col">
                <Field label="Quantite">
                  <TextInput
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => updateFieldWithValidation("quantity", Number(e.target.value))}
                  />
                  {fieldErrors.quantity ? <p className="aa-error-text">{fieldErrors.quantity}</p> : null}
                </Field>
                <Field label="Saison">
                  <SelectInput
                    value={form.season}
                    onChange={(e) => updateFieldWithValidation("season", e.target.value)}
                    options={[
                      { label: "— Choisir —", value: "" },
                      { label: "Toutes saisons", value: "all-season" },
                      { label: "Ete", value: "ete" },
                      { label: "Hiver", value: "hiver" },
                    ]}
                  />
                  {fieldErrors.season ? <p className="aa-error-text">{fieldErrors.season}</p> : null}
                </Field>
              </div>
            </>
          ) : (
            <p className="subtitle">Mode collection active: variantes detaillees masquees.</p>
          )}
        </>
      );
    }

    if (stepKey === "price") {
      return (
        <>
          <h3>Prix & Type d’annonce</h3>
          <div className="aa-two-buttons">
            <button
              type="button"
              className={`aa-toggle-card ${form.listing_type === "sale" ? "active" : ""}`}
              onClick={() => updateField("listing_type", "sale")}
            >
              Vendre avec un prix
            </button>
            <button
              type="button"
              className={`aa-toggle-card aa-donation-card ${form.listing_type === "donation" ? "active" : ""}`}
              onClick={() => {
                updateField("listing_type", "donation");
                updateField("price", "");
              }}
            >
              <Heart size={16} /> Don gratuit
            </button>
          </div>
          <div className={`aa-price-block ${form.listing_type === "donation" ? "disabled" : ""}`}>
            <Field label="Prix (MAD)">
              <TextInput
                type="number"
                min="0"
                value={form.price}
                disabled={form.listing_type === "donation"}
                onChange={(e) => updateFieldWithValidation("price", e.target.value)}
                placeholder="Ex : 80"
              />
              {fieldErrors.price ? <p className="aa-error-text">{fieldErrors.price}</p> : null}
            </Field>
            <div className="aa-pills-wrap">
              <PillButton active={form.negotiable} onClick={() => updateField("negotiable", true)}>
                Oui, negociable
              </PillButton>
              <PillButton active={!form.negotiable} onClick={() => updateField("negotiable", false)}>
                Prix fixe
              </PillButton>
            </div>
          </div>
        </>
      );
    }

    if (stepKey === "location") {
      return (
        <>
          <h3>Localisation & Remise</h3>
          <div className="aa-two-col">
            <Field label="Ville">
              <TextInput
                value={form.pickup_city}
                placeholder="Ex : Marrakech"
                onChange={(e) => updateFieldWithValidation("pickup_city", e.target.value)}
              />
              {fieldErrors.pickup_city ? <p className="aa-error-text">{fieldErrors.pickup_city}</p> : null}
            </Field>
            <Field label="Quartier (optionnel)">
              <TextInput
                value={form.pickup_district}
                placeholder="Ex : Gueliz"
                onChange={(e) => updateFieldWithValidation("pickup_district", e.target.value)}
              />
            </Field>
          </div>
          <div className="aa-icon-grid aa-delivery-grid">
            <IconCardButton
              icon={HandHeart}
              title="En main propre"
              subtitle="Remise en personne"
              active={form.handover_method === "in_person"}
              onClick={() => updateFieldWithValidation("handover_method", "in_person")}
            />
            <IconCardButton
              icon={Truck}
              title="Livraison"
              subtitle="Envoi par coursier"
              active={form.handover_method === "delivery"}
              onClick={() => updateFieldWithValidation("handover_method", "delivery")}
            />
            <IconCardButton
              icon={MapPin}
              title="Les deux"
              subtitle="Main propre ou livraison"
              active={form.handover_method === "both"}
              onClick={() => updateFieldWithValidation("handover_method", "both")}
            />
            <IconCardButton
              icon={Package}
              title="Point relais"
              subtitle="Depot en point collecte"
              active={form.handover_method === "drop_off"}
              onClick={() => updateFieldWithValidation("handover_method", "drop_off")}
            />
          </div>
          {fieldErrors.handover_method ? <p className="aa-error-text">{fieldErrors.handover_method}</p> : null}
        </>
      );
    }

    return null;
  };

  return (
    <main className="announcement-page">
      <section className="announcement-shell">
        <div className="announcement-card">
          <Stepper
            steps={visibleSteps}
            currentStep={currentStepNumber}
            onStepClick={(targetNumber) => {
              const targetKey = visibleSteps[targetNumber - 1]?.key;
              if (targetKey) {
                setStepKey(targetKey);
              }
            }}
          />
          {status && <p className={`status ${status.type}`}>{status.message}</p>}
          {renderStep()}

          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={currentStepNumber === 1 ? () => navigate("/user_dashboard") : goPrev}
            >
              Retour
            </button>
            {!isLastStep ? (
              <button type="button" className="primary" onClick={goNext}>
                Suivant
              </button>
            ) : (
              <button type="button" className="publish" disabled={!canPublish} onClick={submitAnnouncement}>
                Publier l'annonce ✓
              </button>
            )}
          </div>
        </div>
        <div className="announcement-preview">
          <h4>Apercu de l'annonce</h4>
          <div className="preview-card">
            <div className="preview-main-image">
              {mainPhoto ? (
                <>
                  <span className="preview-main-badge">Principale</span>
                  <img src={URL.createObjectURL(mainPhoto)} alt="Photo principale" />
                </>
              ) : (
                <div className="preview-empty-image">
                  <Image size={18} />
                  Photo principale
                </div>
              )}
            </div>

            <div className="preview-row">
              <Tag size={16} />
              <p className="preview-price">
                {form.listing_type === "donation" ? "Don gratuit" : `${form.price || 0} MAD`}
              </p>
            </div>

            <div className="preview-row">
              <Shapes size={16} />
              <h5>{form.item_name || "Titre de l'annonce..."}</h5>
            </div>

            <p className="preview-description">{form.description || "Description..."}</p>

            <div className="preview-meta">
              <div className="preview-row">
                <Shapes size={16} />
                <span>Categorie: {form.category || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Baby size={16} />
                <span>Genre: {form.gender || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Baby size={16} />
                <span>Age: {form.recommended_age || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Ruler size={16} />
                <span>Tailles: {form.sizes.join(", ") || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Palette size={16} />
                <span>Couleurs: {form.colors.join(", ") || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <MapPinned size={16} />
                <span>Ville: {form.pickup_city || "Non defini"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
