
"use client";

import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { malaysianStates, additionalTagsList, halalStatusesList } from '@/data/cafes';
import type { HalalStatus, Cafe } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { addCafe } from '@/services/cafeService';
import { Loader2, UploadCloud, MapPin } from 'lucide-react';
import Link from 'next/link';

const cafeSubmissionSchema = z.object({
  name: z.string().min(3, { message: "Cafe name must be at least 3 characters." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  state: z.string().min(1, { message: "Please select a state." }),
  latitude: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude").optional(),
  longitude: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude").optional(),
  logoLink: z.string().url({ message: "Please enter a valid URL for the logo." }).optional().or(z.literal('')),
  halalStatus: z.enum(halalStatusesList.map(s => s.id) as [HalalStatus, ...HalalStatus[]], {
    required_error: "Please select a halal status."
  }),
  tags: z.array(z.string()).optional(),
  openingHours: z.string().min(5, { message: "Opening hours information seems too short." }),
  websiteLink: z.string().url({ message: "Please enter a valid URL for the website." }).optional().or(z.literal('')),
  socialInstagram: z.string().url({ message: "Please enter a valid URL for Instagram." }).optional().or(z.literal('')),
  socialFacebook: z.string().url({ message: "Please enter a valid URL for Facebook." }).optional().or(z.literal('')),
  socialTwitter: z.string().url({ message: "Please enter a valid URL for Twitter." }).optional().or(z.literal('')),
  socialTiktok: z.string().url({ message: "Please enter a valid URL for TikTok." }).optional().or(z.literal('')),
  socialWhatsapp: z.string()
    .regex(/^(https:\/\/wa\.me\/\S+|^\d{10,15}$)/, { message: "Enter a valid WhatsApp link (e.g., https://wa.me/60123456789) or phone number."})
    .optional().or(z.literal('')),
  rating: z.number().default(0),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions to submit a cafe."
  }),
});

type CafeSubmissionFormData = z.infer<typeof cafeSubmissionSchema>;

interface CafeSubmissionFormProps {
  onFormSubmit?: () => void;
}

export function CafeSubmissionForm({ onFormSubmit }: CafeSubmissionFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<CafeSubmissionFormData>({
    resolver: zodResolver(cafeSubmissionSchema),
    defaultValues: {
      tags: [],
      rating: 0,
      termsAccepted: false,
    }
  });
  const { toast } = useToast();

  const onSubmit: SubmitHandler<CafeSubmissionFormData> = async (formData) => {
    const cafeDataForDb: Partial<Omit<Cafe, 'id'>> = {
      name: formData.name,
      address: formData.address,
      state: formData.state,
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      openingHours: formData.openingHours,
      rating: formData.rating,
      halalStatus: formData.halalStatus,
      tags: formData.tags,
    };

    if (formData.logoLink && formData.logoLink.trim() !== '') {
      cafeDataForDb.logoLink = formData.logoLink;
    } else {
      delete cafeDataForDb.logoLink; // Ensure undefined is not sent
    }

    const socialLinks: Cafe['socialMediaLinks'] = {};
    if (formData.websiteLink && formData.websiteLink.trim() !== '') socialLinks.website = formData.websiteLink;
    if (formData.socialInstagram && formData.socialInstagram.trim() !== '') socialLinks.instagram = formData.socialInstagram;
    if (formData.socialFacebook && formData.socialFacebook.trim() !== '') socialLinks.facebook = formData.socialFacebook;
    if (formData.socialTwitter && formData.socialTwitter.trim() !== '') socialLinks.twitter = formData.socialTwitter;
    if (formData.socialTiktok && formData.socialTiktok.trim() !== '') socialLinks.tiktok = formData.socialTiktok;
    if (formData.socialWhatsapp && formData.socialWhatsapp.trim() !== '') socialLinks.whatsapp = formData.socialWhatsapp;

    if (Object.keys(socialLinks).length > 0) {
      cafeDataForDb.socialMediaLinks = socialLinks;
    } else {
      delete cafeDataForDb.socialMediaLinks; // Ensure undefined is not sent
    }

    const newCafeId = await addCafe(cafeDataForDb as Omit<Cafe, 'id'>);

    if (newCafeId) {
      toast({
        title: "Submission Received! 🍵✨",
        description: `${formData.name} has been submitted for review. Thank you for sharing!`,
      });
      reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
    } else {
      toast({
        title: "Submission Failed",
        description: `Could not submit ${formData.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const selectedTags = watch("tags") || [];

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-1 pt-0 text-center md:text-left">
        <CardTitle className="text-xl md:text-2xl">Submit Your Matcha Café to Our Directory! 🍵✨</CardTitle>
        <CardDescription className="text-sm">
          We’re excited to feature authentic matcha cafés that serve delicious Japanese matcha drinks and desserts.
          Please fill in the details below so fellow matcha lovers can find and enjoy your spot!
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 pb-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-3">

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Café Name</h3>
            <Label htmlFor="name">Please enter just the café’s name (no slogans or extra text).</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> 2. Location</h3>
            <p className="text-sm text-muted-foreground">
              If your café is listed on Google Maps, ensure the address matches.
              For mobile or pop-up vendors not on Google Maps, please enter exact coordinates if possible.
            </p>
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea id="address" {...register("address")} className="mt-1" />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="state" className="mt-1 w-full">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {malaysianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
              </div>
              <div>
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input id="openingHours" {...register("openingHours")} className="mt-1" placeholder="e.g., 10 AM - 10 PM Daily"/>
                {errors.openingHours && <p className="text-xs text-destructive mt-1">{errors.openingHours.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input id="latitude" type="number" step="any" {...register("latitude")} className="mt-1" placeholder="e.g., 3.1390"/>
                {errors.latitude && <p className="text-xs text-destructive mt-1">{errors.latitude.message}</p>}
              </div>
              <div>
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input id="longitude" type="number" step="any" {...register("longitude")} className="mt-1" placeholder="e.g., 101.6869"/>
                {errors.longitude && <p className="text-xs text-destructive mt-1">{errors.longitude.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center"><UploadCloud className="w-5 h-5 mr-2 text-primary" /> 3. Upload Your Logo</h3>
            <Label htmlFor="logoLink">If you’re the owner, provide a link (URL) to your café’s logo to help visitors recognize you.</Label>
            <Input id="logoLink" type="url" {...register("logoLink")} className="mt-1" placeholder="https://yourcafe.com/logo.png"/>
            <p className="text-xs text-muted-foreground mt-1">Direct file upload coming soon! For now, please provide a public URL.</p>
            {errors.logoLink && <p className="text-xs text-destructive mt-1">{errors.logoLink.message}</p>}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">4. Halal Status (Important for Muslim Customers)</h3>
            <p className="text-sm text-muted-foreground">Please select the halal status of your café. If you have halal certification, please contact us on Instagram for official verification.</p>
            <Controller
              name="halalStatus"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="mt-2 space-y-1"
                >
                  {halalStatusesList.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50">
                      <RadioGroupItem value={status.id} id={status.id} />
                      <Label htmlFor={status.id} className="font-normal cursor-pointer">
                        {status.label} <span className="text-muted-foreground text-xs">{status.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.halalStatus && <p className="text-xs text-destructive mt-1">{errors.halalStatus.message}</p>}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">5. Additional Tags</h3>
            <p className="text-sm text-muted-foreground">Help matcha fans find your café by selecting tags that apply:</p>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {additionalTagsList.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTags.includes(tag.label)}
                        onCheckedChange={(checked) => {
                          const currentTags = field.value || [];
                          if (checked) {
                            field.onChange([...currentTags, tag.label]);
                          } else {
                            field.onChange(currentTags.filter((value) => value !== tag.label));
                          }
                        }}
                      />
                      <Label htmlFor={tag.id} className="font-normal cursor-pointer">{tag.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.tags && <p className="text-xs text-destructive mt-1">{errors.tags.message}</p>}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">6. Share Your Social Media Links</h3>
            <p className="text-sm text-muted-foreground">Let visitors see your menu, updates, and beautiful matcha photos:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteLink">Website Link (Optional)</Label>
                <Input id="websiteLink" type="url" {...register("websiteLink")} className="mt-1" placeholder="https://yourcafe.com" />
                {errors.websiteLink && <p className="text-xs text-destructive mt-1">{errors.websiteLink.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialInstagram">Instagram (Optional)</Label>
                <Input id="socialInstagram" type="url" {...register("socialInstagram")} className="mt-1" placeholder="https://instagram.com/yourcafe" />
                {errors.socialInstagram && <p className="text-xs text-destructive mt-1">{errors.socialInstagram.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialFacebook">Facebook (Optional)</Label>
                <Input id="socialFacebook" type="url" {...register("socialFacebook")} className="mt-1" placeholder="https://facebook.com/yourcafe" />
                {errors.socialFacebook && <p className="text-xs text-destructive mt-1">{errors.socialFacebook.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialTwitter">Twitter / X (Optional)</Label>
                <Input id="socialTwitter" type="url" {...register("socialTwitter")} className="mt-1" placeholder="https://x.com/yourcafe" />
                {errors.socialTwitter && <p className="text-xs text-destructive mt-1">{errors.socialTwitter.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialTiktok">TikTok (Optional)</Label>
                <Input id="socialTiktok" type="url" {...register("socialTiktok")} className="mt-1" placeholder="https://tiktok.com/@yourcafe" />
                {errors.socialTiktok && <p className="text-xs text-destructive mt-1">{errors.socialTiktok.message}</p>}
              </div>
              <div>
                <Label htmlFor="socialWhatsapp">WhatsApp (Optional)</Label>
                <Input id="socialWhatsapp" type="text" {...register("socialWhatsapp")} className="mt-1" placeholder="https://wa.me/60123456789 or 0123456789" />
                {errors.socialWhatsapp && <p className="text-xs text-destructive mt-1">{errors.socialWhatsapp.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="termsAccepted"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <Label htmlFor="termsAccepted" className="text-sm font-normal leading-snug">
                I agree to the <Link href="/terms" className="underline text-primary hover:text-accent" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="underline text-primary hover:text-accent" target="_blank">Privacy Policy</Link>.
              </Label>
            </div>
            {errors.termsAccepted && <p className="text-xs text-destructive mt-1">{errors.termsAccepted.message}</p>}
            <p className="text-xs text-muted-foreground">
              You agree to our Terms of Service and Privacy Policy.
            </p>
          </div>


          <p className="text-sm text-muted-foreground pt-4 border-t">
            Thank you for sharing your love of matcha with our community! We review submissions carefully to keep our directory authentic and welcoming.
          </p>

          <div className="pt-2 pb-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Cafe for Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
