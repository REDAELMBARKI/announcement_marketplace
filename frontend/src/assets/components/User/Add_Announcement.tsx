import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ziggyRoute from "../../../utils/route";
import {
  Palette,
  Ruler,
  Shapes,
  Tag,
  Plus,
  X,
} from "lucide-react";
import {
  UserRounded as Baby,
  Book,
  Walking as Footprints,
  HandHeart,
  Heart,
  MapPoint as MapPin,
  Box as Package,
  TShirt as Shirt,
  Gamepad as ToyBrick,
  Delivery as Truck,
} from "@solar-icons/react";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../Common/CustomSelect";
import {
  IconCardButton,
  PillButton,
  Stepper,
} from "./announcement/Shared";
import "../../../css/add_announcement.css";

// Sub-categories data
const SUB_CATEGORIES_MAP: Record<string, string[]> = {
  "Vêtements": ["Hauts & T-shirts", "Pantalons & Jeans", "Robes & Jupes", "Pulls & Cardigans", "Manteaux & Vestes", "Ensembles", "Pyjamas & Maillots", "Sous-vêtements", "Accessoires"],
  "Chaussures": ["Baskets & Sneakers", "Bottes & Bottines", "Sandales & Tongs", "Chaussures de ville", "Chaussons"],
  "Jouets": ["Éveil & Premier âge", "Jeux de société", "Poupées & Figurines", "Véhicules & Circuits", "Jeux de construction", "Jeux d'imitation", "Peluches", "Plein air"],
  "Puériculture": ["Sommeil", "Repas", "Bain & Soins", "Sécurité", "Poussettes & Sièges auto", "Portage"],
  "Livres & Éveil": ["Albums illustrés", "Contes & Histoires", "Livres sonores", "Livres à toucher", "Activités & Coloriages"],
  "Autre": ["Mobilier", "Décoration", "Matériel de sport", "Divers"]
};

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
  super_category_name: string | null;
  sub_category_names: string[];
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

interface User {
  id?: number;
  name?: string;
  email?: string;
}

// Helper to get icon by category name
const getCategoryIcon = (iconName: string): any => {
  const iconMap: Record<string, any> = {
    'shirt': Shirt,
    'footprints': Footprints,
    'gamepad-2': ToyBrick,
    'book-open': Book,
    'baby': Baby,
    'palette': Palette,
    'package': Package,
    'dice-5': ToyBrick,
  };
  return iconMap[iconName] || Package;
};

// Types for field errors and status messages
interface FieldErrors {
  [key: string]: string;
}

interface StatusMessage {
  type: "success" | "error";
  message: string;
}

interface UploadSlot {
  status: 'idle' | 'uploading' | 'done' | 'error';
  url: string | null;
  id: number | null;
}

const BASE_STEPS = [
  { key: "category", label: "Catégorie" },
  { key: "product", label: "Produit & Média" },
  { key: "variants", label: "Variantes" },
  { key: "price", label: "Prix" },
  { key: "location", label: "Localisation" },
];

// Fallback categories while loading
const FALLBACK_CATEGORIES = [
  { id: 1001, name: "Vêtements", icon: Shirt },
  { id: 1002, name: "Chaussures", icon: Footprints },
  { id: 1003, name: "Jouets", icon: ToyBrick },
  { id: 1004, name: "Puériculture", icon: Baby },
  { id: 1005, name: "Livres & Éveil", icon: Book },
  { id: 1006, name: "Autre", icon: Package },
];
const COLORS = ["Rouge", "Bleu", "Vert", "Jaune", "Rose", "Blanc", "Noir", "Multi"];
const SIZES = ["3M", "6M", "12M", "18M", "2A", "3A", "4A", "5A", "6A", "8A", "10A", "12A"];
const MATERIALS = ["Coton", "Laine", "Polyester", "Denim", "Cuir", "Synthetique"];

export default function Add_Announcement() {
  const navigate = useNavigate();
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stepKey, setStepKey] = useState<string>("category");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [uploadSlots, setUploadSlots] = useState<UploadSlot[]>(
    Array(8).fill(null).map(() => ({ status: 'idle', url: null, id: null }))
  );
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  const isUploading = useMemo(() => uploadSlots.some(s => s.status === 'uploading'), [uploadSlots]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [form, setForm] = useState<FormState>({
    super_category_id: null,
    super_category_name: null,
    sub_category_names: [],
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
    currency: "MAD",
    price_negotiable: false,
    pickup_address: "",
    handover_method: "both",
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(ziggyRoute('categories.index'));
        if (response.data.status === "success") {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const visibleSteps = useMemo(() => BASE_STEPS, []);

  const stepIndex = visibleSteps.findIndex((step) => step.key === stepKey);
  const currentStepNumber = stepIndex + 1;
  const isLastStep = currentStepNumber === visibleSteps.length;

  const updateField = (key: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  
  const handleCategorySelect = (id: number, name: string) => {
    setForm(prev => ({
      ...prev,
      super_category_id: id,
      super_category_name: name,
      sub_category_names: [], // Reset sub-categories when main category changes
      sub_category_ids: []
    }));
    clearFieldError('super_category_id');
  };

  const handleSubCategoryChange = (selectedNames: string[]) => {
    setForm(prev => ({
      ...prev,
      sub_category_names: selectedNames
    }));
    clearFieldError('sub_category_names');
  };

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const validateStep = (targetStepKey = stepKey) => {
    const errors: FieldErrors = {};
    if (targetStepKey === "category") {
      if (!form.super_category_id) errors.super_category_id = "Choisissez une catégorie principale.";
      if (form.sub_category_names.length === 0) errors.sub_category_names = "Choisissez une sous-catégorie.";
    }
    if (targetStepKey === "product") {
      if (!form.title.trim()) errors.title = "Le titre est obligatoire.";
      if (!form.description.trim()) errors.description = "La description est obligatoire.";
      if (!form.condition) errors.condition = "Choisissez l'état du produit.";
      if (!uploadSlots.some(s => s.status === 'done')) errors.photos = "Ajoutez au moins une photo.";
    }
    if (targetStepKey === "variants" && form.listing_type === "single") {
      if (!form.sizes.length) errors.sizes = "Sélectionnez au moins une taille.";
      if (!form.colors.length) errors.colors = "Sélectionnez au moins une couleur.";
      if (!form.season) errors.season = "Choisissez une saison.";
    }
    if (targetStepKey === "price" && form.listing_mode === "sell" && !String(form.price).trim()) {
      errors.price = "Le prix est obligatoire pour une vente.";
    }
    if (targetStepKey === "location") {
      if (!form.handover_method) errors.handover_method = "Choisissez un mode de remise.";
      if (!form.pickup_address.trim()) errors.pickup_address = "L'adresse est obligatoire.";
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

  const handleUpload = async (index: number, file: File) => {
    // Set slot to uploading
    setUploadSlots(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'uploading' };
      return next;
    });

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mediable_type', 'product');
      // Set collection based on slot index (0 is thumbnail, others gallery)
      formData.append('collection', index === 0 ? 'thumbnail' : 'gallery');

      const response = await axios.post(ziggyRoute('media.upload'), formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setUploadSlots(prev => {
          const next = [...prev];
          next[index] = { status: 'done', url: response.data.url, id: response.data.mediaId };
          return next;
        });
        clearFieldError('photos');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ') 
        : (error.response?.data?.message || error.message || 'Upload failed');
      
      console.error('Full upload error details:', error.response?.data || error);
      
      setUploadSlots(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'error' };
        return next;
      });
    }
  };

  const onPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>, slotIndex?: number) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (slotIndex !== undefined) {
      // Single slot upload
      await handleUpload(slotIndex, files[0]);
    } else {
      // Multiple upload starting from first idle slot
      let currentFileIndex = 0;
      for (let i = 0; i < uploadSlots.length && currentFileIndex < files.length; i++) {
        if (uploadSlots[i].status === 'idle' || uploadSlots[i].status === 'error') {
          await handleUpload(i, files[currentFileIndex]);
          currentFileIndex++;
        }
      }
    }
    // Clear input
    event.target.value = '';
  };

  const removePhoto = async (indexToRemove: number) => {
    const slot = uploadSlots[indexToRemove];
    if (slot.id) {
      try {
        await axios.delete(ziggyRoute('media.delete-temporary', { mediaId: slot.id }));
      } catch (error) {
        console.error('Failed to delete temporary media:', error);
      }
    }
    
    setUploadSlots(prev => {
      const next = [...prev];
      next[indexToRemove] = { status: 'idle', url: null, id: null };
      return next;
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

    const mediaIds = uploadSlots.filter(s => s.id).map(s => s.id);
    if (mediaIds.length === 0) {
      setStatus({ type: 'error', message: 'Veuillez ajouter au moins une photo.' });
      return;
    }

    const payload = {
      ...form,
      user_id: user.id,
      price: form.listing_mode === "donate" ? 0 : parseFloat(form.price) || 0,
      currency: "MAD",
      media_ids: mediaIds,
    };

    try {
      const response = await axios.post(ziggyRoute('announcements.store'), payload);
      if (response.data.status === "success") {
        setStatus({ type: "success", message: "Annonce publiée avec succès." });
        setTimeout(() => navigate("/my_announcements"), 1200);
        return;
      }
      setStatus({ type: "error", message: response.data.message || "Erreur de validation." });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur réseau.";
      setStatus({ type: "error", message: errorMessage });
    }
  };

  const renderStep = () => {
    switch (stepKey) {
      case "category":
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Choisissez la catégorie
            </Typography>
            <Grid container spacing={2}>
              {(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map((cat: any) => {
                const isFromApi = categories.length > 0;
                const Icon = isFromApi ? getCategoryIcon(cat.icon) : cat.icon;
                const label = isFromApi ? cat.name : cat.name; // Both fallback and api use 'name' now
                const id = cat.id;
                const isActive = form.super_category_id === id;

                return (
                  <Grid item xs={12} sm={4} key={label}>
                    <IconCardButton
                      icon={Icon}
                      title={label}
                      active={isActive}
                      onClick={() => handleCategorySelect(id, label)}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {fieldErrors.super_category_id && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {fieldErrors.super_category_id}
              </Typography>
            )}

            {form.super_category_name && (
              <Box className="aa-subcategories-container" sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#3b82f6', borderRadius: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Choisissez les sous-catégories
                  </Typography>
                </Box>
                
                <CustomSelect
                  label="Sélectionner des sous-catégories"
                  multiple={true}
                  options={(SUB_CATEGORIES_MAP[form.super_category_name] || []).map((name, index) => ({
                    id: `${form.super_category_id}-${index}`,
                    label: name,
                    value: name,
                    icon: <Shapes size={16} />
                  }))}
                  value={form.sub_category_names}
                  onChange={(val) => handleSubCategoryChange(val as string[])}
                  error={!!fieldErrors.sub_category_names}
                  helperText={fieldErrors.sub_category_names}
                />
              </Box>
            )}
          </Box>
        );

      case "product":
        const uploadedCount = uploadSlots.filter(s => s.status !== 'idle').length;
        const firstIdleIndex = uploadSlots.findIndex(s => s.status === 'idle');

        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Détails du produit
            </Typography>
            
            {/* Row 1: Titre and Marque - Equal-width inputs side by side taking the LEFT half of the row. */}
            <Box sx={{ mb: 4, width: '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Titre de l'annonce"
                      placeholder="Ex: Poussette"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      error={!!fieldErrors.title}
                      helperText={fieldErrors.title}
                    />
                    <TextField
                      fullWidth
                      label="Marque (Optionnel)"
                      value={form.brand}
                      onChange={(e) => updateField("brand", e.target.value)}
                      placeholder="Ex: Cybex"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Row 2: Description - Full-width textarea alone on its own row */}
            <Box sx={{ mb: 4, width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Description"
                placeholder="Décrivez votre produit (état, marque, défauts éventuels...)"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
              />
            </Box>

            {/* Row 3: État du produit - Full-width dropdown alone on its own row */}
            <Box sx={{ mb: 4, width: '100%' }}>
              <CustomSelect
                label="État du produit"
                options={[
                  { label: "Neuf avec étiquette", value: "new_tag" },
                  { label: "Neuf sans étiquette", value: "new_no_tag" },
                  { label: "Très bon état", value: "very_good" },
                  { label: "Bon état", value: "good" },
                  { label: "Satisfaisant", value: "fair" },
                ]}
                value={form.condition}
                onChange={(val) => updateField("condition", val)}
                error={!!fieldErrors.condition}
                helperText={fieldErrors.condition}
              />
            </Box>

            {/* Row 4: Photos - Single large dashed-border upload box full width. One empty slot at a time. */}
            <Box sx={{ mb: 4, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Photos
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {uploadSlots.map((slot, index) => {
                  if (slot.status === 'idle') return null;
                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: 'relative', 
                        width: 110, 
                        height: 110,
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        bgcolor: '#f8fafc',
                      }}
                    >
                      {slot.status === 'uploading' && <CircularProgress size={32} />}
                      {slot.status === 'done' && slot.url && (
                        <>
                          <img src={slot.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              bgcolor: 'rgba(255,255,255,0.9)',
                              padding: '2px',
                              '&:hover': { bgcolor: 'white' }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          {index === 0 && (
                            <Box sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              bgcolor: 'rgba(59, 130, 246, 0.8)', 
                              color: 'white', 
                              fontSize: '0.65rem', 
                              textAlign: 'center',
                              py: 0.5,
                              fontWeight: 600
                            }}>
                              Principale
                            </Box>
                          )}
                        </>
                      )}
                      {slot.status === 'error' && (
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="error">Échec</Typography>
                          <IconButton size="small" onClick={() => removePhoto(index)}><X size={14} /></IconButton>
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {firstIdleIndex !== -1 && (
                  <Box 
                    sx={{ 
                      width: uploadedCount === 0 ? '100%' : 110, 
                      height: uploadedCount === 0 ? 200 : 110,
                      borderRadius: 3,
                      border: '2px dashed #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.style.display = 'none';
                      document.body.appendChild(input);
                      input.onchange = (e) => {
                        onPhotoChange(e as any, firstIdleIndex);
                        document.body.removeChild(input);
                      };
                      input.click();
                    }}
                  >
                    <AddPhotoAlternateIcon sx={{ fontSize: uploadedCount === 0 ? 48 : 32, color: '#94a3b8' }} />
                    {uploadedCount === 0 && <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Cliquez pour ajouter des photos</Typography>}
                  </Box>
                )}
              </Box>
              {fieldErrors.photos && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{fieldErrors.photos}</Typography>}
            </Box>
          </Box>
        );

      case "variants":
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Variantes & Caractéristiques
            </Typography>

            <Grid container spacing={3}>
              {[
                { label: "Tailles", field: "sizes", options: SIZES },
                { label: "Couleurs", field: "colors", options: COLORS },
                { label: "Saison", field: "season", options: ["Toutes saisons", "Printemps / Été", "Automne / Hiver"], multiple: false },
                { label: "Matière", field: "material", options: MATERIALS },
                { label: "Genre", field: "gender", options: ["Fille", "Garçon", "Unisexe"], multiple: false },
              ].map((variant, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <CustomSelect
                    label={variant.label}
                    multiple={variant.multiple !== false}
                    placeholder="Choisir..."
                    options={variant.options.map(o => ({ label: o, value: o }))}
                    value={(form as any)[variant.field]}
                    onChange={(val) => updateField(variant.field as keyof FormState, val)}
                    error={!!(fieldErrors as any)[variant.field]}
                    helperText={(fieldErrors as any)[variant.field]}
                    icon={<ChevronRight size={16} />} // Shows a ">" icon by default in CustomSelect or similar
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case "price":
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Prix & Mode de transaction
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'nowrap' }}>
              <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: 2 }}>
                <PillButton 
                  active={form.listing_mode === "donate"} 
                  onClick={() => updateField("listing_mode", "donate")}
                  sx={{ px: 3, py: 1, borderRadius: 1.5, fontWeight: 600 }}
                >
                  Donner
                </PillButton>
                <PillButton 
                  active={form.listing_mode === "sell"} 
                  onClick={() => updateField("listing_mode", "sell")}
                  sx={{ px: 3, py: 1, borderRadius: 1.5, fontWeight: 600 }}
                >
                  Vendre
                </PillButton>
              </Box>

              {form.listing_mode === "sell" && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="Prix"
                    type="number"
                    size="small"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    error={!!fieldErrors.price}
                    helperText={fieldErrors.price}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                    }}
                    sx={{ width: 150 }}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input 
                  type="checkbox" 
                  id="negotiable"
                  checked={form.price_negotiable}
                  onChange={(e) => updateField("price_negotiable", e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="negotiable" style={{ cursor: 'pointer', fontWeight: 500, color: '#475569' }}>Prix négociable</label>
              </Box>
            </Box>
          </Box>
        );

      case "location":
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Localisation & Remise
            </Typography>

            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#475569' }}>Mode de remise</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[
                    { label: "Remise en main propre", value: "pickup" },
                    { label: "Livraison", value: "delivery" },
                    { label: "Les deux", value: "both" }
                  ].map((opt) => (
                    <Box
                      key={opt.value}
                      onClick={() => updateField("handover_method", opt.value)}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: form.handover_method === opt.value ? '#3b82f6' : '#e2e8f0',
                        bgcolor: form.handover_method === opt.value ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#3b82f6' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: form.handover_method === opt.value ? '#1d4ed8' : '#475569' }}>
                        {opt.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Adresse de retrait / Ville"
                  placeholder="Ex: Casablanca, Maarif"
                  value={form.pickup_address}
                  onChange={(e) => updateField("pickup_address", e.target.value)}
                  error={!!fieldErrors.pickup_address}
                  helperText={fieldErrors.pickup_address}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                    Récapitulatif de votre annonce
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Titre</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.title || "Non défini"}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Catégorie</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.super_category_name || "Non définie"}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Mode de transaction</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.listing_mode === 'sell' ? 'Vente' : 'Don'}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Prix</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#3b82f6' }}>{form.listing_mode === 'sell' ? `${form.price} MAD` : 'Gratuit'}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 0, px: 0 }}>
      <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
        {/* Left Column - Form (70%) - Sticky left edge, no padding */}
        <Grid item xs={12} md={8.4} sx={{ 
          flexBasis: { md: '70% !important' },
          maxWidth: { md: '70% !important' },
          width: { md: '70% !important' },
          p: 0,
          m: 0
        }}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 6 }, borderRadius: 0, borderRight: '1px solid #e2e8f0', minHeight: '100vh', width: '100%' }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
              Publier une annonce
            </Typography>

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

            <Box sx={{ mt: 4, minHeight: '400px', width: '100%' }}>
              {status && (
                <Box sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  bgcolor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: status.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                  {status.message}
                </Box>
              )}
              {renderStep()}
            </Box>

            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={currentStepNumber === 1 ? () => navigate("/user_dashboard") : goPrev}
                sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600 }}
              >
                Retour
              </Button>
              
              {!isLastStep ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={goNext}
                  sx={{ borderRadius: 2, px: 4, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600 }}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitAnnouncement}
                  disabled={isUploading}
                  sx={{ borderRadius: 2, px: 4, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
                >
                  {isUploading ? <CircularProgress size={24} color="inherit" /> : "Publier l'annonce"}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Preview (30%) - Sticky right edge, no padding */}
        <Grid item xs={12} md={3.6} sx={{ 
          flexBasis: { md: '30% !important' },
          maxWidth: { md: '30% !important' },
          width: { md: '30% !important' },
          p: 0,
          m: 0,
          bgcolor: '#f8fafc' // Subtle background for the preview column
        }}>
          <Box sx={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflowY: 'auto', p: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                border: '1px solid #e2e8f0', 
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                width: '100%'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 18, bgcolor: '#3b82f6', borderRadius: 1 }} />
                Aperçu de l'annonce
              </Typography>

              {/* Main Photo Preview */}
              <Box sx={{ 
                width: '100%', 
                aspectRatio: '1/1', 
                borderRadius: 3, 
                bgcolor: '#f1f5f9',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                position: 'relative',
                border: '1px solid #e2e8f0'
              }}>
                {uploadSlots.find(s => s.status === 'done')?.url ? (
                  <img 
                    src={uploadSlots.find(s => s.status === 'done')!.url!}
                    alt="Principale" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Aucune photo</Typography>
                  </Box>
                )}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  left: 12, 
                  bgcolor: form.listing_mode === 'sell' ? '#3b82f6' : '#10b981', 
                  color: '#fff', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1.5, 
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  textTransform: 'uppercase'
                }}>
                  {form.listing_mode === 'sell' ? `${form.price || 0} MAD` : 'GRATUIT'}
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b', lineHeight: 1.3 }}>
                {form.title || "Titre de l'annonce"}
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, minHeight: '3em', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {form.description || "Votre description apparaîtra ici..."}
              </Typography>

              <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Catégorie</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{form.super_category_name || "-"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>État</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {form.condition === 'new_tag' ? 'Neuf' : 
                       form.condition === 'very_good' ? 'Très bon' : 
                       form.condition === 'good' ? 'Bon état' : 
                       form.condition === 'fair' ? 'Satisfaisant' : '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Genre</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {form.gender === 'boy' ? 'Garçon' : 
                       form.gender === 'girl' ? 'Fille' : 
                       form.gender === 'unisex' ? 'Unisexe' : '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Tailles</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {form.sizes.length > 0 ? form.sizes.join(', ') : "-"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f5f9', borderRadius: 2.5, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MapPin size={18} color="#64748b" />
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                  {form.pickup_address || "Localisation..."}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ mt: 2, p: 2, bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #dbeafe', display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, width: '100%', textAlign: 'center' }}>?</Typography>
                </Box>
              <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 500, lineHeight: 1.4 }}>
                Besoin d'aide ? Consultez nos conseils pour une annonce réussie.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
