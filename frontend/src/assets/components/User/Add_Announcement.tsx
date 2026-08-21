import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import ziggyRoute from "../../../utils/route";
import {
  Palette,
  Ruler,
  Shapes,
  Tag,
  Plus,
  X,
  ChevronRight,
  Eye,
  Sparkles,
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
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputLabel,
  ClickAwayListener,
  Snackbar,
  Drawer,
  Fab,
  MenuItem,
  Select,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../Common/CustomSelect";
import { detectUserLocationByIp, DbCountry, fetchPlaceSuggestions, PlaceSuggestion, resetSessionToken } from "../../../services/locationService";
import {
  IconCardButton,
  PillButton,
  Stepper,
} from "./announcement/Shared";
import "../../../css/add_announcement.css";

  // Color mapping for French names to Hex (base map, will be augmented by API)
  const COLOR_MAP: Record<string, string> = {
    "Noir": "#000000",
    "Blanc": "#FFFFFF",
    "Gris": "#808080",
    "Rouge": "#FF0000",
    "Bleu": "#0000FF",
    "Vert": "#008000",
    "Jaune": "#FFFF00",
    "Rose": "#FFC0CB",
    "Violet": "#800080",
    "Orange": "#FFA500",
    "Marron": "#A52A2A",
    "Beige": "#F5F5DC",
    "Marine": "#000080",
    "Ciel": "#87CEEB",
    "Doré": "#FFD700",
    "Argenté": "#C0C0C0",
    "Multicolore": "linear-gradient(45deg, red, blue, green, yellow)"
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
  city: string;
  district?: string;
  place_id?: string;
  country_id?: number | string;
  handover_method: string;
  pickup_address: string;
  contact_phone: string;
  custom_colors: { name: string; hex: string }[];
}

interface User {
  id?: number;
  slug?: string;
  name?: string;
  role?: string;
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

interface FilterAttributes {
  cities: string[];
  ageRanges: string[];
  clothingSizes: string[];
  shoeSizes: string[];
  conditions: { label: string; value: string }[];
  listingTypes: string[];
  materials: string[];
  colors: string[];
}

interface Product {
  id: number;
  slug: string;
  user?: {
    id: number;
    slug: string;
    name: string;
  };
  super_category_id: number;
  super_category_name?: string;
  sub_category_names?: string[];
  title: string;
  description: string;
  listing_type: "single" | "collection";
  listing_mode: "sell" | "donate";
  price: string | number;
  currency: string;
  price_negotiable: boolean;
  condition: string;
  gender: string;
  age_range: string;
  brand?: string;
  season?: string;
  sizes?: string[];
  colors?: string[];
  city: string;
  pickup_address: string;
  contact_phone: string;
  handover_method: string;
  thumbnail?: { url: string; id: number };
  gallery?: { url: string; id: number }[];
}

interface AddAnnouncementProps {
  product?: Product;
}

export default function Add_Announcement({ product: propProduct }: AddAnnouncementProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userSlug, announcementSlug } = useParams();
  const [product, setProduct] = useState<Product | undefined>(propProduct || location.state?.product);
  const isEditMode = !!product || (!!userSlug && !!announcementSlug);
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product if slugs are present and no product in state
  useEffect(() => {
    if (userSlug && announcementSlug && !product) {
      const fetchProduct = async () => {
        try {
        const response = await api.get(ziggyRoute('announcements.show', { 
          announcement: announcementSlug 
        }));
        if (response.data.status === "success") {
            setProduct(response.data.product);
          }
        } catch (error) {
          console.error("Failed to fetch product by slug:", error);
          setStatus({ type: 'error', message: "Impossible de charger l'annonce." });
        }
      };
      fetchProduct();
    }
  }, [userSlug, announcementSlug, product]);

  const [stepKey, setStepKey] = useState<string>("category");

  // Scroll to top of the page whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepKey]);
  
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [uploadSlots, setUploadSlots] = useState<UploadSlot[]>(
    Array(8).fill(null).map(() => ({ status: 'idle', url: null, id: null }))
  );
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  const isUploading = useMemo(() => uploadSlots.some(s => s.status === 'uploading'), [uploadSlots]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbCountries, setDbCountries] = useState<DbCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<DbCountry | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<PlaceSuggestion[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);
  const [addressSuggestions, setAddressSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState<boolean>(false);

  const [attributes, setAttributes] = useState<FilterAttributes>({
    cities: [],
    ageRanges: [],
    clothingSizes: [],
    shoeSizes: [],
    conditions: [],
    listingTypes: [],
    materials: [],
    colors: []
  });

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
    city: "",
    district: "",
    place_id: "",
    pickup_address: "",
    contact_phone: "+212",
    handover_method: "both",
    custom_colors: [],
  });

  const [tempColorName, setTempColorName] = useState("");
  const [tempColorHex, setTempColorHex] = useState("#3b82f6");

  // Debounced Place Autocomplete (250ms delay to prevent excessive API requests)
  useEffect(() => {
    if (!form.city || form.city.trim().length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setIsSearchingCity(false);
      return;
    }

    setIsSearchingCity(true);
    setShowCitySuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const suggestions = await fetchPlaceSuggestions(form.city, selectedCountry?.code);
        setCitySuggestions(suggestions);
      } finally {
        setIsSearchingCity(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [form.city, selectedCountry?.code]);

  // Fetch initial data and pre-fill if in edit mode
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await api.get(ziggyRoute('marketplace.init-data'));
        if (response.data.status === "success") {
          const loadedCountries: DbCountry[] = response.data.countries || [];
          setDbCountries(loadedCountries);
          setCategories(response.data.categories || []);
          setAttributes({
            cities: [],
            ageRanges: response.data.ageRanges || [],
            clothingSizes: response.data.clothingSizes || [],
            shoeSizes: response.data.shoeSizes || [],
            conditions: response.data.conditions || [],
            listingTypes: response.data.listingTypes || [],
            materials: response.data.materials || [],
            colors: response.data.colors || []
          });

          // Detect IP location and set initial country & dial code
          try {
            const loc = await detectUserLocationByIp();
            const matched = loadedCountries.find(
              c => c.code.toUpperCase() === loc.countryCode.toUpperCase()
            ) || loadedCountries[0];

            if (matched) {
              setSelectedCountry(matched);
              setForm(prev => ({
                ...prev,
                contact_phone: matched.dial_code
              }));
            }
          } catch (e) {
            if (loadedCountries.length > 0) {
              setSelectedCountry(loadedCountries[0]);
            }
          }

          // Pre-fill form if in edit mode
          if (isEditMode && product) {
            const subCategoryNames = product.sub_category_names || [];
            setForm({
              super_category_id: product.super_category_id,
              super_category_name: product.super_category_name || null,
              sub_category_names: subCategoryNames,
              sub_category_ids: [], 
              title: product.title,
              description: product.description,
              listing_type: product.listing_type,
              gender: product.gender,
              age_range: product.age_range,
              brand: product.brand || "",
              condition: product.condition,
              sizes: product.sizes || [],
              colors: product.colors || [],
              season: product.season || "",
              material: "", 
              listing_mode: product.listing_mode,
              price: String(product.price),
              currency: product.currency,
              price_negotiable: product.price_negotiable,
              city: product.city || "",
              pickup_address: product.pickup_address,
              contact_phone: product.contact_phone || (product as any).phone_contact,
              handover_method: product.handover_method,
              custom_colors: [],
            });

            // Set upload slots
            const slots: UploadSlot[] = Array(8).fill(null).map(() => ({ status: 'idle', url: null, id: null }));
            if (product.thumbnail) {
              slots[0] = { status: 'done', url: product.thumbnail.url, id: product.thumbnail.id };
            }
            if (product.gallery) {
              product.gallery.forEach((media, idx) => {
                if (idx + 1 < slots.length) {
                  slots[idx + 1] = { status: 'done', url: media.url, id: media.id };
                }
              });
            }
            setUploadSlots(slots);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitData();
  }, [isEditMode, product]);

  const visibleSteps = useMemo(() => BASE_STEPS, []);

  const stepIndex = visibleSteps.findIndex((step) => step.key === stepKey);
  const currentStepNumber = stepIndex + 1;
  const isLastStep = currentStepNumber === visibleSteps.length;

  const selectedCategory = useMemo(() => 
    categories.find(c => Number(c.id) === Number(form.super_category_id)), 
    [categories, form.super_category_id]
  );

  const updateField = (key: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  
  const handleCategorySelect = (id: number, name: string) => {
    setForm(prev => ({
      ...prev,
      super_category_id: id,
      super_category_name: name,
      sub_category_names: [], 
      sub_category_ids: []
    }));
    clearFieldError('super_category_id');
  };

  const handleSubCategoryChange = (selectedIds: (number | string)[]) => {
    const numericIds = selectedIds.map(id => Number(id));
    const targetCat = categories.find(c => Number(c.id) === Number(form.super_category_id));
    const names = (targetCat?.children || [])
      .filter(child => numericIds.includes(Number(child.id)))
      .map(child => child.label || (child as any).name);

    setForm(prev => ({
      ...prev,
      sub_category_ids: numericIds,
      sub_category_names: names
    }));
    clearFieldError('sub_category_ids');
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
      if (form.sub_category_ids.length === 0) errors.sub_category_ids = "Choisissez une sous-catégorie.";
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
      if (!form.city.trim()) errors.city = "Saisissez ou choisissez votre ville.";
      if (!form.contact_phone.trim() || form.contact_phone === selectedCountry?.dial_code) {
        errors.contact_phone = "Le numéro de téléphone est obligatoire.";
      }
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
    console.log(`[MediaUpload] Starting upload for slot ${index}`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      collection: index === 0 ? 'thumbnail' : 'gallery'
    });

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

      const response = await api.post(ziggyRoute('media.upload'), formData);

      console.log(`[MediaUpload] Upload response for slot ${index}:`, response.data);

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
      
      console.error(`[MediaUpload Error] Failed slot ${index}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errorMsg: errorMessage
      });
      
      setUploadSlots(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'error' };
        return next;
      });
      setStatus({ type: 'error', message: `Échec de téléversement (${file.name}): ${errorMessage}` });
    }
  };

  const onPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>, slotIndex?: number) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    console.log('[MediaUpload] Files selected from input:', files.map(f => f.name));

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
    console.log(`[MediaUpload] Removing photo at slot ${indexToRemove}`, slot);
    if (slot.id) {
      try {
        await api.delete(ziggyRoute('media.delete-temporary', { mediaId: slot.id }));
      } catch (error) {
        console.error('[MediaUpload Error] Failed to delete temporary media:', error);
      }
    }
    
    setUploadSlots(prev => {
      const next = [...prev];
      next[indexToRemove] = { status: 'idle', url: null, id: null };
      return next;
    });
  };

  const submitAnnouncement = async () => {
    console.log('[AnnouncementSubmit] Initiating submission...', { form, isEditMode });
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
      city: form.city,
      district: form.district || null,
      place_id: form.place_id || null,
      country_id: selectedCountry?.id,
      price: form.listing_mode === "donate" ? 0 : parseFloat(form.price) || 0,
      currency: "MAD",
      media_ids: mediaIds,
    };

    try {
      let response;
      if (isEditMode && product) {
        response = await api.put(ziggyRoute('announcements.update', { 
          announcement: product.slug 
        }), payload);
      } else {
        response = await api.post(ziggyRoute('announcements.store'), payload);
      }

      if (response.data.status === "success") {
        setStatus({ type: "success", message: isEditMode ? "Annonce mise à jour avec succès." : "Annonce publiée avec succès." });
        setToastOpen(true);
        const targetSlug = response.data.product?.slug || product?.slug;
        setTimeout(() => {
          if (targetSlug) {
            navigate(`/announcements/${targetSlug}`);
          } else {
            navigate("/user_dashboard");
          }
        }, 1200);
        return;
      }
      setStatus({ type: "error", message: response.data.message || "Erreur de validation." });
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ') 
        : (error.response?.data?.message || "Erreur réseau.");
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
                const label = isFromApi ? cat.name : cat.name;
                const id = cat.id;
                const isActive = Number(form.super_category_id) === Number(id);

                return (
                  <Grid item xs={6} sm={4} key={label}>
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

            {form.super_category_id && (
              <Box className="aa-subcategories-container" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#3b82f6', borderRadius: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Choisissez les sous-catégories
                  </Typography>
                </Box>
                
                <CustomSelect
                  label="Sélectionner des sous-catégories"
                  multiple={true}
                  searchable={true}
                  options={(categories.find(c => Number(c.id) === Number(form.super_category_id))?.children || []).map((child) => ({
                    id: String(child.id),
                    label: child.label || child.name,
                    value: Number(child.id),
                    icon: <Shapes size={16} />
                  }))}
                  value={form.sub_category_ids}
                  onChange={(val) => handleSubCategoryChange(val as number[])}
                  error={!!fieldErrors.sub_category_ids}
                  helperText={fieldErrors.sub_category_ids}
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
            
            {/* Row 1: Titre and Marque - Responsive 2 column grid */}
            <Box sx={{ mb: 3, width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Titre de l'annonce"
                    placeholder="Ex: Poussette Cybex Mios"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    error={!!fieldErrors.title}
                    helperText={fieldErrors.title}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Marque (Optionnel)"
                    value={form.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="Ex: Cybex"
                  />
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
                  options={attributes.conditions}
                  value={form.condition}
                  onChange={(val) => {
                    const selected = attributes.conditions.find(o => (o.value || o.id) === val);
                    updateField("condition", selected?.value || val);
                  }}
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
        const sizesOptions = (form.super_category_name === "Chaussures" ? attributes.shoeSizes : attributes.clothingSizes);
        
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Variantes & Caractéristiques
            </Typography>

            {/* Collection Checkbox */}
            <Box sx={{ width: '100%', p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input 
                  type="checkbox" 
                  id="is_collection"
                  checked={form.listing_type === "collection"}
                  onChange={(e) => updateField("listing_type", e.target.checked ? "collection" : "single")}
                  style={{ width: 24, height: 24, cursor: 'pointer' }}
                />
                <Box>
                  <label htmlFor="is_collection" style={{ cursor: 'pointer', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                    Vendez-vous une collection ou un article individuel ?
                  </label>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                    Cochez cette case si vous vendez un lot d'articles (les options de taille et couleur deviendront facultatives).
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tailles */}
            <Box sx={{ width: '100%' }}>
              <CustomSelect
                label={`Tailles ${form.listing_type === 'collection' ? '(Optionnel)' : ''}`}
                multiple={true}
                placeholder="Choisir les tailles..."
                options={sizesOptions.map(o => (typeof o === 'string' ? { id: o, label: o, value: o } : o))}
                value={form.sizes}
                onChange={(val) => updateField("sizes", val)}
                error={!!fieldErrors.sizes}
                helperText={fieldErrors.sizes}
                renderType="pills"
              />
            </Box>

            {/* Couleurs */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#1e293b' }}>
                Couleurs {form.listing_type === 'collection' ? '(Optionnel)' : ''}
              </Typography>
              
              <CustomSelect
                multiple={true}
                options={attributes.colors.map(o => {
                  const label = o.label || o.name;
                  const value = o.value || o.id;
                  const hex = o.hex || (COLOR_MAP[label] || value);
                  return {
                    id: String(value),
                    label: label,
                    value: label, // We use name as value for now based on form state
                    hex: hex
                  };
                })}
                value={form.colors}
                onChange={(val) => updateField("colors", val)}
                error={!!fieldErrors.colors}
                helperText={fieldErrors.colors}
                renderType="colors"
              />

              {/* Custom Color Picker */}
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Palette size={18} /> Ajouter une couleur personnalisée
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* List of custom colors being added */}
                  {form.custom_colors.map((cc, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#fff', p: 1, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: cc.hex, border: '1px solid #e2e8f0' }} />
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>{cc.name}</Typography>
                      <IconButton size="small" onClick={() => {
                        const nameToRemove = form.custom_colors[idx].name;
                        const newCustomColors = form.custom_colors.filter((_, i) => i !== idx);
                        updateField("custom_colors", newCustomColors);
                        if (nameToRemove) {
                          updateField("colors", form.colors.filter(c => c !== nameToRemove));
                        }
                      }}>
                        <X size={18} />
                      </IconButton>
                    </Box>
                  ))}

                  {/* Add new custom color input */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid #3b82f6', flexShrink: 0 }}>
                      <input 
                        type="color" 
                        value={tempColorHex || "#3b82f6"}
                        onChange={(e) => setTempColorHex(e.target.value)}
                        style={{ 
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          cursor: 'pointer',
                          border: 'none',
                          padding: 0
                        }}
                      />
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <Plus size={20} color="#3b82f6" />
                      </Box>
                    </Box>
                    <TextField
                      size="small"
                      placeholder="Nom de la couleur (min 3 car.)"
                      value={tempColorName}
                      onChange={(e) => setTempColorName(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    />
                    <Button 
                      variant="contained" 
                      size="small"
                      disabled={tempColorName.trim().length < 3}
                      onClick={() => {
                        const newName = tempColorName.trim();
                        if (newName.length >= 3) {
                          const newCustomColor = { name: newName, hex: tempColorHex || "#3b82f6" };
                          updateField("custom_colors", [...form.custom_colors, newCustomColor]);
                          
                          // Add to main colors list
                          if (!form.colors.includes(newName)) {
                            updateField("colors", [...form.colors, newName]);
                          }
                          
                          // Update dynamic map
                          COLOR_MAP[newName] = newCustomColor.hex;
                          
                          // Reset temp
                          setTempColorName("");
                        }
                      }}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Other fields */}
            {[
              { label: "Saison", field: "season", options: ["Toutes saisons", "Printemps / Été", "Automne / Hiver"], multiple: false },
              { label: "Matière", field: "material", options: attributes.materials },
              { label: "Âge recommandé", field: "age_range", options: attributes.ageRanges, multiple: false },
            ].map((variant, idx) => (
              <Box key={idx} sx={{ width: '100%' }}>
                <CustomSelect
                  label={variant.label}
                  multiple={variant.multiple !== false}
                  placeholder="Choisir..."
                  options={variant.options.map(o => (typeof o === 'string' ? { id: o, label: o, value: o } : o))}
                  value={(form as any)[variant.field]}
                  onChange={(val) => updateField(variant.field as keyof FormState, val)}
                  error={!!(fieldErrors as any)[variant.field]}
                  helperText={(fieldErrors as any)[variant.field]}
                  icon={<ChevronRight size={16} />} 
                />
              </Box>
            ))}
          </Box>
        );

      case "price":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Prix & Mode de transaction
            </Typography>

            {/* Mode de transaction - Single row */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#475569' }}>Mode de transaction</Typography>
              <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: 2, width: 'fit-content' }}>
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
            </Box>

            {form.listing_mode === "sell" && (
              <>
                {/* Price input - Single row alone */}
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Prix"
                    type="number"
                    size="medium"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    error={!!fieldErrors.price}
                    helperText={fieldErrors.price}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                      }
                    }}
                  />
                </Box>
                
                {/* Negotiable checkbox - Single row alone */}
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <input 
                    type="checkbox" 
                    id="negotiable"
                    checked={form.price_negotiable}
                    onChange={(e) => updateField("price_negotiable", e.target.checked)}
                    style={{ width: 22, height: 22, cursor: 'pointer' }}
                  />
                  <label htmlFor="negotiable" style={{ cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>
                    Le prix est négociable
                  </label>
                </Box>
              </>
            )}
          </Box>
        );

      case "location":
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Localisation & Remise
            </Typography>

            {/* Mode de remise cards - Stacked vertically */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#475569' }}>Mode de remise</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: "Remise en main propre", value: "pickup" },
                  { label: "Livraison", value: "delivery" },
                  { label: "Les deux", value: "both" }
                ].map((opt) => (
                  <Box
                    key={opt.value}
                    onClick={() => updateField("handover_method", opt.value)}
                    sx={{
                      width: '100%',
                      p: 2.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: form.handover_method === opt.value ? '#3b82f6' : '#e2e8f0',
                      bgcolor: form.handover_method === opt.value ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': { borderColor: '#3b82f6', bgcolor: '#f8fafc' }
                    }}
                  >
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      border: '2px solid',
                      borderColor: form.handover_method === opt.value ? '#3b82f6' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fff'
                    }}>
                      {form.handover_method === opt.value && (
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: form.handover_method === opt.value ? '#1d4ed8' : '#334155' }}>
                      {opt.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Pays (Database-driven) */}
            <Box sx={{ width: '100%' }}>
              <CustomSelect
                label="Pays"
                options={dbCountries.map((c) => ({
                  id: c.code,
                  label: `${c.flag || ''} ${c.name} (${c.dial_code})`,
                  value: c.code,
                }))}
                value={selectedCountry?.code || ""}
                onChange={(code) => {
                  const country = dbCountries.find((c) => c.code === code);
                  if (country) {
                    setSelectedCountry(country);
                    const currentPhoneRaw = (form.contact_phone || "").replace(/^\+\d+/, '');
                    updateField("contact_phone", `${country.dial_code}${currentPhoneRaw}`);
                  }
                }}
                placeholder="Sélectionnez un pays..."
              />
            </Box>

            {/* Ville (Autocomplete - Plain string) */}
            <ClickAwayListener onClickAway={() => setShowCitySuggestions(false)}>
              <Box sx={{ width: '100%', position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Ville"
                  placeholder="Rechercher une ville..."
                  value={form.city}
                  onChange={(e) => {
                    updateField("city", e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setShowCitySuggestions(true);
                    }
                  }}
                  onFocus={() => {
                    if (form.city.trim().length >= 2) {
                      setShowCitySuggestions(true);
                    }
                  }}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city || "Saisie semi-automatique des villes"}
                  slotProps={{
                    htmlInput: { spellCheck: false, autoCorrect: 'off' },
                    input: {
                      startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment>,
                      endAdornment: isSearchingCity ? (
                        <InputAdornment position="end">
                          <CircularProgress size={18} />
                        </InputAdornment>
                      ) : null,
                    }
                  }}
                />
                {showCitySuggestions && form.city.trim().length >= 2 && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      zIndex: 9999,
                      width: '100%',
                      mt: 0.5,
                      maxHeight: 240,
                      overflowY: 'auto',
                      borderRadius: 2,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {isSearchingCity ? (
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Recherche de villes...
                        </Typography>
                      </Box>
                    ) : citySuggestions.length > 0 ? (
                      citySuggestions.map((sug) => (
                        <Box
                          key={sug.placeId}
                          onClick={() => {
                            updateField("city", sug.cityName);
                            updateField("district", sug.secondaryText || "");
                            updateField("place_id", sug.placeId);
                            resetSessionToken();
                            setShowCitySuggestions(false);
                          }}
                          sx={{
                            py: 1.5,
                            px: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            transition: 'background-color 0.15s ease',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {sug.cityName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {sug.secondaryText || sug.fullAddress}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Aucune ville trouvée
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            {/* Adresse de retrait (Simple text field, optional) */}
            <Box sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Adresse de retrait (optionnel)"
                placeholder="Ex: Rue 123, Quartier..."
                value={form.pickup_address}
                onChange={(e) => updateField("pickup_address", e.target.value)}
                error={!!fieldErrors.pickup_address}
                helperText={fieldErrors.pickup_address || "Indiquez l'adresse ou le quartier de retrait (optionnel)"}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment>,
                  }
                }}
              />
            </Box>

            {/* Contact Téléphonique - Dynamic Dial Code */}
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth variant="outlined" error={!!fieldErrors.contact_phone}>
                <InputLabel htmlFor="contact-phone">Numéro de téléphone</InputLabel>
                <OutlinedInput
                  id="contact-phone"
                  label="Numéro de téléphone"
                  placeholder="6XXXXXXXX"
                  value={
                    selectedCountry
                      ? (form.contact_phone || "").replace(selectedCountry.dial_code, '')
                      : (form.contact_phone || "").replace(/^\+\d+/, '')
                  }
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('0')) val = val.substring(1);
                    const dial = selectedCountry?.dial_code || "+212";
                    updateField("contact_phone", `${dial}${val}`);
                  }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <Select
                        variant="standard"
                        disableUnderline
                        value={selectedCountry?.code || (dbCountries[0]?.code || "")}
                        onChange={(e) => {
                          const country = dbCountries.find((c) => c.code === e.target.value);
                          if (country) {
                            setSelectedCountry(country);
                            const currentDigits = (form.contact_phone || "").replace(/^\+\d+/, '');
                            updateField("contact_phone", `${country.dial_code}${currentDigits}`);
                          }
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                            py: 0.5,
                            pr: '22px !important',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#1e293b',
                            cursor: 'pointer',
                          }
                        }}
                      >
                        {dbCountries.map((c) => (
                          <MenuItem key={c.id || c.code} value={c.code} sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <span style={{ fontSize: '18px' }}>{c.flag || '🌐'}</span>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {c.name}
                            </Typography>
                            <Typography variant="caption" sx={{ ml: 'auto', color: '#64748b', fontWeight: 700 }}>
                              {c.dial_code}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                      <Box sx={{ height: 24, width: '1px', bgcolor: '#cbd5e1', ml: 1, mr: 0.5 }} />
                    </InputAdornment>
                  }
                />
                {fieldErrors.contact_phone && (
                  <FormHelperText id="contact-phone-error-text">
                    {fieldErrors.contact_phone}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  const renderPreviewCard = () => (
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
      <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
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
        mb: 2.5,
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
      
      <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, minHeight: '2.5em', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {form.description || "Votre description apparaîtra ici..."}
      </Typography>

      <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Category & Sub-categories */}
        <Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Catégorie</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{form.super_category_name || "-"}</Typography>
          {form.sub_category_names.length > 0 && (
            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2, color: '#64748b' }}>
              {form.sub_category_names.map((name, i) => (
                <Box component="li" key={i} sx={{ fontSize: '0.75rem', fontWeight: 500, mb: 0.2 }}>
                  {name}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Brand */}
        {form.brand && (
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Marque</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{form.brand}</Typography>
          </Box>
        )}

        {/* Condition */}
        <Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>État</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
            {form.condition === 'new_tag' ? 'Neuf avec étiquette' : 
             form.condition === 'new_no_tag' ? 'Neuf sans étiquette' :
             form.condition === 'very_good' ? 'Très bon état' : 
             form.condition === 'good' ? 'Bon état' : 
             form.condition === 'fair' ? 'Satisfaisant' : '-'}
          </Typography>
        </Box>

        {/* Sizes */}
        {form.sizes.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Tailles</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {form.sizes.map(size => (
                <Chip key={size} label={size} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#f1f5f9' }} />
              ))}
            </Box>
          </Box>
        )}

        {/* Colors */}
        {form.colors.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Couleurs</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{form.colors.join(', ')}</Typography>
          </Box>
        )}

        {/* Season */}
        {form.season && (
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Saison</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{form.season}</Typography>
          </Box>
        )}

        {/* Handover Method */}
        <Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>Mode de remise</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
            {form.handover_method === 'pickup' ? 'Remise en main propre' : 
             form.handover_method === 'delivery' ? 'Livraison' : 
             form.handover_method === 'both' ? 'Main propre & Livraison' : '-'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2.5, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <MapPin size={18} color="#64748b" />
        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
          {form.city ? `${form.city}, ` : ""}{form.pickup_address || "Localisation..."}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth={false} sx={{ py: 0, px: 0, pb: { xs: 8, md: 0 } }}>
      <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
        {/* Main Form Column (100% on mobile, 70% on desktop) */}
        <Grid item xs={12} md={8.4} sx={{ 
          flexBasis: { xs: '100%', md: '70% !important' },
          maxWidth: { xs: '100%', md: '70% !important' },
          width: { xs: '100%', md: '70% !important' },
          p: 0,
          m: 0
        }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 2.5, sm: 4, md: 6 }, 
            borderRadius: 0, 
            borderRight: { xs: 'none', md: '1px solid #e2e8f0' }, 
            minHeight: { xs: 'auto', md: '100vh' }, 
            width: '100%' 
          }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 800, mb: { xs: 3, md: 4 }, color: '#0f172a' }}>
              {isEditMode ? "Modifier l'annonce" : "Publier une annonce"}
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

            <Box sx={{ mt: { xs: 2, md: 4 }, minHeight: '350px', width: '100%' }}>
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

            <Box sx={{ 
              mt: 6, 
              display: 'flex', 
              justify: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexDirection: { xs: 'column-reverse', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={currentStepNumber === 1 ? () => navigate("/user_dashboard") : goPrev}
                sx={{ borderRadius: 2.5, px: 4, py: 1.2, textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
              >
                {currentStepNumber === 1 ? "Annuler" : "Retour"}
              </Button>
              
              {!isLastStep ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={goNext}
                  sx={{ borderRadius: 2.5, px: 5, py: 1.2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitAnnouncement}
                  disabled={isUploading}
                  sx={{ borderRadius: 2.5, px: 5, py: 1.2, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
                >
                  {isUploading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isEditMode ? (
                    "Mettre à jour"
                  ) : (
                    "Publier l'annonce"
                  )}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Desktop Preview (30%) - Hidden on mobile */}
        <Grid item xs={12} md={3.6} sx={{ 
          display: { xs: 'none', md: 'block' },
          flexBasis: { md: '30% !important' },
          maxWidth: { md: '30% !important' },
          width: { md: '30% !important' },
          p: 0,
          m: 0,
          bgcolor: '#f8fafc'
        }}>
          <Box sx={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflowY: 'auto', p: 4 }}>
            {renderPreviewCard()}

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

      {/* Floating Mobile Preview Button */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Fab
          color="primary"
          variant="extended"
          onClick={() => setMobilePreviewOpen(true)}
          sx={{
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' },
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            textTransform: 'none',
            fontWeight: 700,
            px: 2.5
          }}
        >
          <Eye size={20} style={{ marginRight: 8 }} />
          Aperçu
        </Fab>
      </Box>

      {/* Mobile Preview Drawer */}
      <Drawer
        anchor="bottom"
        open={mobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            p: 2.5,
            maxHeight: '85vh',
            bgcolor: '#f8fafc'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Aperçu de votre annonce
          </Typography>
          <IconButton onClick={() => setMobilePreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', pb: 2 }}>
          {renderPreviewCard()}
        </Box>
      </Drawer>

      {/* Success Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity="success" 
          sx={{ width: '100%', borderRadius: 3, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          {isEditMode ? "Annonce mise à jour avec succès !" : "Félicitations ! Votre annonce a été publiée avec succès."}
        </Alert>
      </Snackbar>
    </Container>
  );
}
