// src/app/admin/edit-cafe/[id]/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

// React Hook Form imports
import type { SubmitHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Loader2,
  ShieldAlert,
  ArrowLeft,
  Save,
  UploadCloud,
  MapPin,
  Clock, // For submitted/approved timestamps
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Data imports
import { malaysianStates, additionalTagsList, halalStatusesList } from '@/data/cafes';
import type { Cafe, HalalStatus } from '@/types';
import { getCafeById, updateCafe } from '@/services/cafeService';

// --- Zod Schema for Validation (Adapted for Edit) ---
const cafeEditSchema = z.object({
  name: z.string().min(3, { message: "Cafe name must be at least 3 characters." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  state: z.string().min(1, { message: "Please select a state." }),
  latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude").optional().nullable(),
  longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude").optional().nullable(),
  logoFile: z.instanceof(File).optional().nullable(), // For new file upload
  halalStatus: z.enum(halalStatusesList.map(s => s.id) as [HalalStatus, ...HalalStatus[]], {
    required_error: "Please select a halal status."
  }),
  tags: z.array(z.string()).max(3, { message: "You can only select up to 3 tags" }).optional(),
  openingHours: z.string().min(5, { message: "Opening hours information seems too short." }),
  websiteLink: z.string().url({ message: "Please enter a valid URL for the website." }).optional().or(z.literal('')),
  socialInstagram: z.string().url({ message: "Please enter a valid URL for Instagram." }).optional().or(z.literal('')),
  socialFacebook: z.string().url({ message: "Please enter a valid URL for Facebook." }).optional().or(z.literal('')),
  socialTwitter: z.string().url({ message: "Please enter a valid URL for Twitter." }).optional().or(z.literal('')),
  socialTiktok: z.string().url({ message: "Please enter a valid URL for TikTok." }).optional().or(z.literal('')),
  socialWhatsapp: z.string()
    .regex(/^(https:\/\/wa\.me\/\S+|^\d{10,15}$)/, { message: "Enter a valid WhatsApp link (e.g., https://wa.me/60123456789) or phone number."})
    .optional().or(z.literal('')),
  businessStatus: z.enum(["OPERATIONAL", "CLOSED_PERMANENTLY", "TEMPORARILY_CLOSED"]),
  // These fields are for display, not for direct form input, but included in schema for `reset` typing
  submittedAt: z.union([z.instanceof(Date), z.string()]).optional(),
  approvedAt: z.union([z.instanceof(Date), z.string()]).optional(),
});

type CafeEditFormZodData = z.infer<typeof cafeEditSchema>;

interface EditCafePageProps {
  params: { id: string };
}

export default function EditCafePage({ params }: EditCafePageProps) {
  const { id } = params;
  const decodedId = decodeURIComponent(id);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { toast } = useToast();

  const [loadingCafe, setLoadingCafe] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [originalCafeLogoLink, setOriginalCafeLogoLink] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CafeEditFormZodData>({
    resolver: zodResolver(cafeEditSchema),
    defaultValues: {
      tags: [],
      halalStatus: "Not Specified",
      businessStatus: "OPERATIONAL",
    }
  });

  // --- Authentication and Data Fetching ---
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/admin/login");
      return;
    }
    if (sessionStatus === "authenticated" && !isAdmin) {
      router.push("/admin/login");
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      return;
    }

    if (isAdmin && decodedId) {
      const fetchCafeData = async () => {
        setLoadingCafe(true);
        try {
          const foundCafe = await getCafeById(decodedId);

          if (foundCafe) {
            // Firestore Timestamps are automatically converted to Date objects by getCafeById
            // Now, convert Date objects to ISO strings for consistent RHF defaultValues
            reset({
              name: foundCafe.name,
              address: foundCafe.address,
              state: foundCafe.state,
              latitude: foundCafe.latitude ?? null,
              longitude: foundCafe.longitude ?? null,
              halalStatus: foundCafe.halalStatus,
              tags: foundCafe.tags || [],
              openingHours: foundCafe.openingHours,
              websiteLink: foundCafe.socialMediaLinks?.website || '',
              socialInstagram: foundCafe.socialMediaLinks?.instagram || '',
              socialFacebook: foundCafe.socialMediaLinks?.facebook || '',
              socialTwitter: foundCafe.socialMediaLinks?.twitter || '',
              socialTiktok: foundCafe.socialMediaLinks?.tiktok || '',
              socialWhatsapp: foundCafe.socialMediaLinks?.whatsapp || '',
              businessStatus: foundCafe.businessStatus || "OPERATIONAL",
              // Convert Date objects from service to ISO strings for Zod schema and display
              submittedAt: foundCafe.submittedAt ? foundCafe.submittedAt.toISOString() : undefined,
              approvedAt: foundCafe.approvedAt ? foundCafe.approvedAt.toISOString() : undefined,
            });
            setLogoPreview(foundCafe.logoLink || null);
            setOriginalCafeLogoLink(foundCafe.logoLink || null);
          } else {
            toast({
              title: "Cafe Not Found",
              description: `Cafe with ID '${decodedId}' not found.`,
              variant: "destructive",
            });
            router.push("/admin/approved-cafes");
          }
        } catch (error) {
          console.error("Error fetching cafe for edit:", error);
          toast({
            title: "Error Loading Cafe",
            description: "Could not load cafe details. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/approved-cafes");
        } finally {
          setLoadingCafe(false);
        }
      };
      fetchCafeData();
    }
  }, [decodedId, isAdmin, sessionStatus, router, toast, reset]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("logoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, revert the preview to the original logo if it existed
      // This implies the user didn't explicitly "remove" it, just cleared the input.
      setValue("logoFile", undefined); // Explicitly set to undefined (no change to file)
      setLogoPreview(originalCafeLogoLink);
    }
  };

  const handleRemoveLogo = () => {
    setValue("logoFile", null); // Set to null to explicitly signal removal
    setLogoPreview(null); // Clear preview entirely
  };

  const onSubmit: SubmitHandler<CafeEditFormZodData> = async (formData) => {
    if (!isAdmin || isSubmitting) return;

    const cafeIdForUpdate = decodedId;

    const cafeDataForDb: Partial<Omit<Cafe, 'id' | 'submittedAt' | 'approvedAt' | 'rating' | 'userRatingTotal' | 'rejectedAt' | 'logoLink'>> = {
      name: formData.name,
      address: formData.address,
      state: formData.state,
      latitude: formData.latitude,
      longitude: formData.longitude,
      openingHours: formData.openingHours,
      halalStatus: formData.halalStatus,
      tags: formData.tags || [],
      businessStatus: formData.businessStatus,
    };

    const socialLinks: Partial<Cafe['socialMediaLinks']> = {};
    if (formData.websiteLink && formData.websiteLink.trim() !== '') socialLinks.website = formData.websiteLink;
    if (formData.socialInstagram && formData.socialInstagram.trim() !== '') socialLinks.instagram = formData.socialInstagram;
    if (formData.socialFacebook && formData.socialFacebook.trim() !== '') socialLinks.facebook = formData.socialFacebook;
    if (formData.socialTwitter && formData.socialTwitter.trim() !== '') socialLinks.twitter = formData.socialTwitter;
    if (formData.socialTiktok && formData.socialTiktok.trim() !== '') socialLinks.tiktok = formData.socialTiktok;
    if (formData.socialWhatsapp && formData.socialWhatsapp.trim() !== '') socialLinks.whatsapp = formData.socialWhatsapp;

    if (Object.keys(socialLinks).length > 0) {
      cafeDataForDb.socialMediaLinks = socialLinks as Cafe['socialMediaLinks'];
    } else {
      cafeDataForDb.socialMediaLinks = {};
    }

    try {
      const success = await updateCafe(
        cafeIdForUpdate,
        cafeDataForDb,
        formData.logoFile,
        originalCafeLogoLink
      );

      if (success) {
        toast({ title: "Cafe Updated", description: `${formData.name} details saved successfully.` });
        router.push("/admin/approved-cafes");
      } else {
        toast({ title: "Update Failed", description: `Could not update ${formData.name}. Please try again.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error during cafe update:", error);
      toast({ title: "Update Error", description: `An unexpected error occurred during update.`, variant: "destructive" });
    }
  };

  const selectedTags = watch("tags") || [];

  // --- Render Loading/Access Denied States ---
  if (sessionStatus === "loading" || loadingCafe) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-950 text-neutral-100">
        <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
        <p className="ml-4 text-lg text-neutral-400">
          {sessionStatus === "loading" ? "Loading authentication..." : "Loading cafe details..."}
        </p>
      </div>
    );
  }

  if (sessionStatus === "authenticated" && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 text-center text-neutral-100">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-red-400 mb-2">Access Denied</h1>
        <p className="text-neutral-400">You do not have the required role to view this page.</p>
      </div>
    );
  }

  if (!watch('name') && !loadingCafe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 text-center text-neutral-100">
        <h1 className="text-2xl font-semibold text-neutral-100 mb-2">Cafe Not Found</h1>
        <p className="text-neutral-400">The cafe you are trying to edit does not exist or an error occurred.</p>
        <Button onClick={() => router.push("/admin/approved-cafes")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Approved Cafes
        </Button>
      </div>
    );
  }

  // --- Main Edit Form Content ---
  return (
    <>
      <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-8 py-5 flex-shrink-0">
        <div>
          <Button variant="ghost" onClick={() => router.push("/admin/approved-cafes")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            Edit Cafe: {watch('name')}
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Modify the details of this approved matcha cafe.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" form="edit-cafe-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </header>

      <section className="p-8 flex-1 overflow-y-auto">
        <form id="edit-cafe-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Cafe Name */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold text-primary">1. Cafe Name</h3>
            <p className="text-neutral-400 text-sm">
              Please enter just the cafe’s name (no slogans or extra text).
            </p>
            <Label htmlFor="name" className="sr-only">Cafe Name</Label>
            <Input id="name" {...register("name")} className="w-full bg-neutral-800 border-neutral-700 text-neutral-100" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <Separator className="bg-neutral-700" />

          {/* Location */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold flex items-center text-primary"><MapPin className="w-6 h-6 mr-2" /> 2. Location</h3>
            <p className="text-neutral-400 text-sm">
              If your cafe is listed on Google Maps, ensure the address matches. For mobile or pop-up vendors not on Google Maps, please enter exact coordinates if possible.
            </p>
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea id="address" {...register("address")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" />
              {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger id="state" className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 text-neutral-100 border-neutral-700">
                        {malaysianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
              </div>
              <div>
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input id="openingHours" {...register("openingHours")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="e.g., 10 AM - 10 PM Daily"/>
                {errors.openingHours && <p className="text-sm text-destructive mt-1">{errors.openingHours.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input id="latitude" type="number" step="any" {...register("latitude")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="e.g., 3.1390"/>
                {errors.latitude && <p className="text-sm text-destructive mt-1">{errors.latitude.message}</p>}
              </div>
              <div>
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input id="longitude" type="number" step="any" {...register("longitude")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="e.g., 101.6869"/>
                {errors.longitude && <p className="text-sm text-destructive mt-1">{errors.longitude.message}</p>}
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-700" />

          {/* Logo Upload */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold flex items-center text-primary"><UploadCloud className="w-6 h-6 mr-2" /> 3. Cafe Logo</h3>
            <p className="text-neutral-400 text-sm">
              Upload or update your cafe’s logo (e.g., PNG, JPG) to help visitors recognize you.
            </p>
            <Label htmlFor="logoFile" className="sr-only">Cafe Logo File</Label>
            <Input
              id="logoFile"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleLogoFileChange}
              className="w-full file:text-neutral-300 file:bg-neutral-700 file:border-neutral-600 hover:file:bg-neutral-600"
            />
            {(logoPreview || originalCafeLogoLink) && (
              <div className="mt-4 p-4 border border-neutral-700 rounded-lg bg-neutral-800">
                <p className="text-sm text-neutral-300 mb-2">Current Logo:</p>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-24 w-auto object-contain border border-neutral-600 rounded-md p-1 bg-neutral-900" />
                ) : (
                  <p className="text-sm text-neutral-500">No logo selected for preview.</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo} className="mt-3 bg-red-800 text-red-100 hover:bg-red-700 border-red-700">
                  Remove Current Logo
                </Button>
                {/* Conditional messages for logo status */}
                {watch("logoFile") === null && !logoPreview && originalCafeLogoLink && (
                  <p className="text-yellow-500 text-sm mt-2">Logo will be removed upon saving changes.</p>
                )}
                {watch("logoFile") instanceof File && logoPreview && originalCafeLogoLink && (
                  <p className="text-emerald-500 text-sm mt-2">New logo selected. Old logo will be replaced upon saving.</p>
                )}
              </div>
            )}
            {!logoPreview && !originalCafeLogoLink && watch("logoFile") !== null && ( // Show this if no logo at all, and no explicit removal
              <p className="text-neutral-400 text-sm mt-2">No logo currently set. Choose a file to add one.</p>
            )}
            {errors.logoFile && <p className="text-sm text-destructive mt-1">{errors.logoFile.message}</p>}
          </div>

          <Separator className="bg-neutral-700" />

          {/* Halal Status */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold text-primary">4. Halal Status (Important for Muslim Customers)</h3>
            <Controller
              name="halalStatus"
              control={control}
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  {halalStatusesList.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-800 bg-neutral-900 text-neutral-100 border-neutral-700 cursor-pointer">
                      <RadioGroupItem value={status.id} id={`halal-${status.id}`} />
                      <Label htmlFor={`halal-${status.id}`} className="font-medium cursor-pointer flex-1">
                        {status.label} <span className="text-neutral-400 text-sm block mt-1">{status.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.halalStatus && <p className="text-sm text-destructive mt-1">{errors.halalStatus.message}</p>}
          </div>

          <Separator className="bg-neutral-700" />

          {/* Additional Tags */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold text-primary">5. Additional Tags</h3>
            <p className="text-neutral-400 text-sm">Select up to 3 tags that best describe your cafe:</p>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {additionalTagsList.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-neutral-800 bg-neutral-900 text-neutral-100 border-neutral-700 cursor-pointer"
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={field.value?.includes(tag.id)}
                        onCheckedChange={(checked) => {
                          const currentTags = field.value || [];
                          if (checked) {
                            if (currentTags.length >= 3) {
                              toast({
                                title: "Maximum Tags Reached",
                                description: "You can only select up to 3 tags",
                                variant: "destructive",
                              });
                              return;
                            }
                            field.onChange([...currentTags, tag.id]);
                          } else {
                            field.onChange(currentTags.filter(t => t !== tag.id));
                          }
                        }}
                        disabled={!field.value?.includes(tag.id) && (field.value?.length || 0) >= 3}
                      />
                      <Label
                        htmlFor={`tag-${tag.id}`}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.tags && (
              <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>
            )}
            <p className="text-sm text-neutral-400 mt-2">
              Selected: {selectedTags.length}/3 tags
            </p>
          </div>

          <Separator className="bg-neutral-700" />

          {/* Social Media Links */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold text-primary">6. Share Your Social Media Links</h3>
            <p className="text-neutral-400 text-sm">Let visitors see your menu, updates, and beautiful matcha photos:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteLink">Website Link (Optional)</Label>
                <Input id="websiteLink" type="url" {...register("websiteLink")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://yourcafe.com" />
                {errors.websiteLink && <p className="text-sm text-destructive mt-1">{errors.websiteLink.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialInstagram">Instagram (Optional)</Label>
                <Input id="socialInstagram" type="url" {...register("socialInstagram")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://instagram.com/yourcafe" />
                {errors.socialInstagram && <p className="text-sm text-destructive mt-1">{errors.socialInstagram.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialFacebook">Facebook (Optional)</Label>
                <Input id="socialFacebook" type="url" {...register("socialFacebook")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://facebook.com/yourcafe" />
                {errors.socialFacebook && <p className="text-sm text-destructive mt-1">{errors.socialFacebook.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialTwitter">Twitter / X (Optional)</Label>
                <Input id="socialTwitter" type="url" {...register("socialTwitter")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://x.com/yourcafe" />
                {errors.socialTwitter && <p className="text-sm text-destructive mt-1">{errors.socialTwitter.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialTiktok">TikTok (Optional)</Label>
                <Input id="socialTiktok" type="url" {...register("socialTiktok")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://tiktok.com/@yourcafe" />
                {errors.socialTiktok && <p className="text-sm text-destructive mt-1">{errors.socialTiktok.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialWhatsapp">WhatsApp (Optional)</Label>
                <Input id="socialWhatsapp" type="text" {...register("socialWhatsapp")} className="mt-2 w-full bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="https://wa.me/60123456789 or 0123456789" />
                {errors.socialWhatsapp && <p className="text-sm text-destructive mt-1">{errors.socialWhatsapp.message}</p>}
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-700" />

          {/* Business Status */}
          <div className="space-y-3 mx-1">
            <h3 className="text-xl font-semibold text-primary">7. Business Status</h3>
            <Label htmlFor="businessStatus" className="sr-only">Business Status</Label>
            <Controller
              name="businessStatus"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-[180px] mt-2 bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 text-neutral-100 border-neutral-700">
                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                    <SelectItem value="CLOSED_PERMANENTLY">Closed Permanently</SelectItem>
                    <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.businessStatus && <p className="text-sm text-destructive mt-1">{errors.businessStatus.message}</p>}
          </div>

          {/* Timestamps Section - moved visually to the bottom of the form for context */}
          <Separator className="bg-neutral-700" />
          <div className="space-y-2 mx-1 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h3 className="text-xl font-semibold text-neutral-300">Timestamps</h3>
            {watch('submittedAt') && (
              <p className="text-sm text-neutral-400 flex items-center">
                <Clock className="inline-block w-4 h-4 mr-2 text-neutral-500" />
                Submitted: {new Date(watch('submittedAt') as string).toLocaleString()}
              </p>
            )}
            {watch('approvedAt') && (
              <p className="text-sm text-neutral-400 flex items-center">
                <Clock className="inline-block w-4 h-4 mr-2 text-neutral-500" />
                Approved: {new Date(watch('approvedAt') as string).toLocaleString()}
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}