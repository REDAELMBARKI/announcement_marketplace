import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Image,
  MapPinned,
  Palette,
  Ruler,
  Shapes,
  Tag,
  Plus,
  X,
} from "lucide-react";
import {
  Baby,
  BookOpen,
  Footprints,
  HandHeart,
  Heart,
  MapPoint as MapPin,
  Box as Package,
  Shirt,
  ToyBrick,
  Delivery as Truck,
} from "@solar-icons/react";
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

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  children: Category[];
}

interface FormState {
  super_category_id: number | null;
  sub_category_ids: number[];
  title: string;
  description: string;
  listing_type: "single" | "collection";
  listing_mode: "sell" | "donate";
  price: string;
  currency: string;
  price_negotiable: boolean;
  condition: string;
  material: string;
  gender: string;
  age_range: string;
  brand: string;
  season: string;
  sizes: string[];
  colors: string[];
  handover_method: string;
  pickup_address: string;
}

// Helper to get icon by category name
const getCategoryIcon = (iconName: string): any => {
  const iconMap: Record<string, any> = {
    'shirt': Shirt,
    'footprints': Footprints,
    'gamepad-2': ToyBrick,
    'book-open': BookOpen,
    'home': Baby,
    'baby': Baby,
    'palette': Palette,
    'package': Package,
    'dice-5': ToyBrick,
  };
  return iconMap[iconName] || Package;
};

interface FieldErrors {
  [key: string]: string;
}

interface StatusMessage {
  type: "success" | "error";
  message: string;
}

const BASE_STEPS = [
  { key: "category", label: "Categorie" },
  { key: "product", label: "Produit & Media" },
  { key: "variants", label: "Variantes" },
  { key: "price", label: "Prix" },
  { key: "location", label: "Localisation" },
];

// Fallback categories while loading
const FALLBACK_CATEGORIES = [
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

  const [stepKey, setStepKey] = useState<string>("category");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [mediaIds, setMediaIds] = useState<number[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [form, setForm] = useState<FormState>({
    super_category_id: null,
    sub_category_ids: [],    
    title: "",
    description: "",
    listing_type: "single",
    gender: "",
    age_range: "",
    brand: "",
    condition: "",
    sizes: [],
    colors: [],
    season: "",
    material: "",
    listing_mode: "donate",
    price: "",
    price_negotiable: false,
    pickup_address: "",
    handover_method: "both",
  });

  const visibleSteps = useMemo(() => BASE_STEPS, []);
  const mainPhoto = photos[mainPhotoIndex] || photos[0] || null;

  const stepIndex = visibleSteps.findIndex((step) => step.key === stepKey);
  const currentStepNumber = stepIndex + 1;
  const isLastStep = currentStepNumber === visibleSteps.length;

  const canPublish = useMemo(() => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.condition &&
      form.pickup_address?.trim() &&
      form.handover_method
    );
  }, [form]);

  const updateField = (key: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const updateFieldWithValidation = (key: keyof FormState, value: any) => {
    updateField(key, value);
    clearFieldError(key);
  };

  const toggleItem = (key: keyof FormState, value: any) => {
    setForm((prev) => {
      const selected = prev[key] as any[];
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
    if (targetStepKey === "category" && !form.super_category_id) {
      errors.super_category_id = "Choisissez une categorie principale.";
    }
    if (targetStepKey === "product") {
      if (!form.title.trim()) errors.title = "Le titre est obligatoire.";
      if (!form.description.trim()) errors.description = "La description est obligatoire.";
      if (!form.condition) errors.condition = "Choisissez l'etat du produit.";
      if (!photos.length) errors.photos = "Ajoutez au moins une photo.";
    }
    if (targetStepKey === "variants" && form.listing_type === "single") {
      if (!form.sizes.length) errors.sizes = "Selectionnez au moins une taille.";
      if (!form.colors.length) errors.colors = "Selectionnez au moins une couleur.";
      if (!form.season) errors.season = "Choisissez une saison.";
    }
    if (targetStepKey === "price" && form.listing_mode === "sell" && !String(form.price).trim()) {
      errors.price = "Le prix est obligatoire pour une vente.";
    }
    if (targetStepKey === "location") {
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

  const uploadImages = async (files) => {
    setIsUploading(true);
    const uploadedMediaIds = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        // First image is thumbnail, others are gallery
        formData.append('collection', i === 0 ? 'thumbnail' : 'gallery');
        
        const response = await fetch('http://localhost:8000/api/media/upload', {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          uploadedMediaIds.push(result.mediaId);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      }
      
      setMediaIds(uploadedMediaIds);
      setPhotos(files);
      return uploadedMediaIds;
    } catch (error) {
      setStatus({ type: 'error', message: 'Image upload failed. Please try again.' });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const onPhotoChange = async (event) => {
    const incoming = Array.from(event.target.files || []);
    const merged = [...photos, ...incoming].slice(0, 8);
    
    // Upload new images
    const newMediaIds = await uploadImages(incoming);
    if (newMediaIds.length > 0) {
      setPhotos(merged);
      if (mainPhotoIndex >= merged.length) {
        setMainPhotoIndex(0);
      }
      clearFieldError('photos');
    }
  };

  const removePhoto = async (indexToRemove) => {
    // Delete temporary media if it exists
    const mediaIdToRemove = mediaIds[indexToRemove];
    if (mediaIdToRemove) {
      try {
        await fetch(`http://localhost:8000/api/media/temporary/${mediaIdToRemove}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete temporary media:', error);
      }
    }
    
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
    setMediaIds((prev) => prev.filter((_, index) => index !== indexToRemove));
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
    if (!user?.id) {
      setStatus({ type: "error", message: "Connectez-vous d'abord." });
      return;
    }

    const submitErrors = validateStep("location");
    if (Object.keys(submitErrors).length) {
      setFieldErrors(submitErrors);
      setStatus({ type: "error", message: "Veuillez corriger les erreurs avant publication." });
      return;
    }

    if (mediaIds.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one photo.' });
      return;
    }

    // Build payload as JSON to support arrays properly
    const payload = {
      ...form,
      user_id: user.id,
      currency: "MAD",
      super_category_id: form.super_category_id, // Single super category
      sub_category_ids: form.sub_category_ids,   // Multiple sub categories
      media_ids: mediaIds, // Send as array, not JSON string
    };

    try {
      const response = await fetch("http://localhost:8000/api/announcements", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { 
          Accept: "application/json",
          "Content-Type": "application/json"
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setStatus({ type: "success", message: "Annonce publiee avec succes." });
        setTimeout(() => navigate("/my_announcements"), 1200);
        return;
      }
      setStatus({ type: "error", message: result.message || "Erreur de validation." });
    } catch (error) {
      setStatus({ type: "error", message: "Erreur reseau." });
    }
  };

  const renderStep = () => {
  if (stepKey === "category") {
      // Get selected super category's sub-categories
      const selectedSuperCategory = categories.find(cat => cat.id === form.super_category_id);
      const subCategories = selectedSuperCategory?.children || [];

      return (
        <>
          <h3>Qu'annoncez-vous aujourd'hui ?</h3>
          
          {/* Loading State */}
          {categoriesLoading && (
            <div className="aa-loading-categories">
              <p>Chargement des categories...</p>
            </div>
          )}
          
          {/* Super Category - Single Select */}
          <div className="aa-section">
            <p className="subtitle">1. Selectionnez une categorie principale</p>
            {fieldErrors.super_category_id ? <p className="aa-error-text">{fieldErrors.super_category_id}</p> : null}
            
            {categories.length > 0 ? (
              <div className="aa-icon-grid">
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  return (
                    <IconCardButton
                      key={category.id}
                      icon={IconComponent}
                      title={category.name}
                      active={form.super_category_id === category.id}
                      onClick={() => {
                        updateFieldWithValidation("super_category_id", category.id);
                        // Clear sub-categories when super category changes
                        updateField("sub_category_ids", []);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="aa-icon-grid">
                {FALLBACK_CATEGORIES.map(({ label, icon }, index) => (
                  <IconCardButton
                    key={label}
                    icon={icon}
                    title={label}
                    active={form.super_category_id === index + 1}
                    onClick={() => {
                      updateFieldWithValidation("super_category_id", index + 1);
                      updateField("sub_category_ids", []);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sub Categories Container - Multi Select */}
          {form.super_category_id && subCategories.length > 0 && (
            <div className="aa-subcategories-container">
              <div className="aa-subcategories-header">
                <h4>Sous-categories pour {selectedSuperCategory?.name}</h4>
                <span className="aa-subcategories-count">
                  {form.sub_category_ids.length} selectionnee(s)
                </span>
              </div>
              <p className="aa-subcategories-hint">Selectionnez une ou plusieurs sous-categories (optionnel)</p>
              
              <div className="aa-subcategories-grid">
                {subCategories.map((subCategory) => (
                  <label 
                    key={subCategory.id} 
                    className={`aa-subcategory-card ${form.sub_category_ids.includes(subCategory.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.sub_category_ids.includes(subCategory.id)}
                      onChange={() => toggleItem("sub_category_ids", subCategory.id)}
                      className="aa-subcategory-input"
                    />
                    <span className="aa-subcategory-name">{subCategory.name}</span>
                    {form.sub_category_ids.includes(subCategory.id) && (
                      <span className="aa-subcategory-check">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (stepKey === "product") {
      return (
        <>
          <h3>Media & Details produit</h3>
          <div className="aa-media-uploader">
            {isUploading && (
              <div className="aa-upload-status">
                <p>Uploading images...</p>
              </div>
            )}
            <div className="aa-photos-row">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${index}`} className={`aa-thumb ${index === 0 ? "main" : ""}`}>
                  {index === 0 ? <span className="aa-main-tag">Principale</span> : null}
                  <button type="button" className="aa-thumb-delete" onClick={() => removePhoto(index)}>
                    <X size={14} strokeWidth={2} />
                  </button>
                  <img src={URL.createObjectURL(photo)} alt={photo.name} />
                </div>
              ))}

              {photos.length < 8 && !isUploading ? (
                <button
                  type="button"
                  className="aa-ghost-uploader"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={18} strokeWidth={2} />
                  <Plus size={14} strokeWidth={2} />
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
                value={form.title}
                placeholder="Ex : Manteau chaud garcon 4 ans"
                onChange={(e) => updateFieldWithValidation("title", e.target.value)}
              />
              {fieldErrors.title ? <p className="aa-error-text">{fieldErrors.title}</p> : null}
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
                value={form.age_range}
                onChange={(e) => updateFieldWithValidation("age_range", e.target.value)}
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
              checked={form.listing_type === "collection"}
              onChange={(e) => updateField("listing_type", e.target.checked ? "collection" : "single")}
            />
            C'est un lot / collection
          </label>
          {form.listing_type === "single" ? (
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
              className={`aa-toggle-card ${form.listing_mode === "sell" ? "active" : ""}`}
              onClick={() => updateField("listing_mode", "sell")}
            >
              Vendre avec un prix
            </button>
            <button
              type="button"
              className={`aa-toggle-card aa-donation-card ${form.listing_mode === "donate" ? "active" : ""}`}
              onClick={() => {
                updateField("listing_mode", "donate");
                updateField("price", "");
              }}
            >
              <Heart size={16} weight="BoldDuotone" /> Don gratuit
            </button>
          </div>
          <div className={`aa-price-block ${form.listing_mode === "donate" ? "disabled" : ""}`}>
            <Field label="Prix (MAD)">
              <TextInput
                type="number"
                min="0"
                value={form.price}
                disabled={form.listing_mode === "donate"}
                onChange={(e) => updateFieldWithValidation("price", e.target.value)}
                placeholder="Ex : 80"
              />
              {fieldErrors.price ? <p className="aa-error-text">{fieldErrors.price}</p> : null}
            </Field>
            <div className="aa-pills-wrap">
              <PillButton active={form.price_negotiable} onClick={() => updateField("price_negotiable", true)}>
                Oui, negociable
              </PillButton>
              <PillButton active={!form.price_negotiable} onClick={() => updateField("price_negotiable", false)}>
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
          <Field label="Adresse de retrait">
            <TextInput
              value={form.pickup_address}
              placeholder="Ex : 123 Rue Mohammed, Marrakech"
              onChange={(e) => updateFieldWithValidation("pickup_address", e.target.value)}
            />
            {fieldErrors.pickup_address ? <p className="aa-error-text">{fieldErrors.pickup_address}</p> : null}
          </Field>
          <div className="aa-icon-grid aa-delivery-grid">
            <IconCardButton
              icon={HandHeart}
              title="En main propre"
              subtitle="Remise en personne"
              active={form.handover_method === "pickup"}
              onClick={() => updateFieldWithValidation("handover_method", "pickup")}
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
                  <Image size={18} strokeWidth={2} />
                  Photo principale
                </div>
              )}
            </div>

            <div className="preview-row">
              <Tag size={16} strokeWidth={2} />
              <p className="preview-price">
                {form.listing_mode === "donate" ? "Don gratuit" : `${form.price || 0} MAD`}
              </p>
            </div>

            <div className="preview-row">
              <Shapes size={16} strokeWidth={2} />
              <h5>{form.title || "Titre de l'annonce..."}</h5>
            </div>

            <p className="preview-description">{form.description || "Description..."}</p>

            <div className="preview-meta">
              <div className="preview-row">
                <Shapes size={16} strokeWidth={2} />
                <span>Categorie: {form.super_category_id ? categories.find(c => c.id === form.super_category_id)?.name : "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Baby size={16} weight="BoldDuotone" />
                <span>Genre: {form.gender || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Baby size={16} weight="BoldDuotone" />
                <span>Age: {form.age_range || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Ruler size={16} strokeWidth={2} />
                <span>Tailles: {form.sizes.join(", ") || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <Palette size={16} strokeWidth={2} />
                <span>Couleurs: {form.colors.join(", ") || "Non defini"}</span>
              </div>
              <div className="preview-row">
                <MapPinned size={16} strokeWidth={2} />
                <span>Adresse: {form.pickup_address || "Non defini"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
