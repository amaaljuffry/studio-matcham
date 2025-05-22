
"use client";

import React from 'react'; // Removed useState as it's not used directly
import { useForm, SubmitHandler, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { malaysianStates } from '@/data/cafes';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const cafeSubmissionSchema = z.object({
  name: z.string().min(3, { message: "Cafe name must be at least 3 characters." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  state: z.string().min(1, { message: "Please select a state." }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  openingHours: z.string().min(5, { message: "Opening hours seem too short." }),
  menuLink: z.string().url({ message: "Please enter a valid URL for the menu." }).optional().or(z.literal('')),
  image: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal('')), // Consider making this a file upload in future
  tags: z.string().optional(), // Comma-separated
  websiteLink: z.string().url({ message: "Please enter a valid URL for the website." }).optional().or(z.literal('')),
  instagramLink: z.string().url({ message: "Please enter a valid URL for Instagram." }).optional().or(z.literal('')),
  facebookLink: z.string().url({ message: "Please enter a valid URL for Facebook." }).optional().or(z.literal('')),
});

type CafeSubmissionFormData = z.infer<typeof cafeSubmissionSchema>;

interface CafeSubmissionFormProps {
  onFormSubmit?: () => void; // Optional callback to close dialog
}

export function CafeSubmissionForm({ onFormSubmit }: CafeSubmissionFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<CafeSubmissionFormData>({
    resolver: zodResolver(cafeSubmissionSchema),
  });
  const { toast } = useToast();

  const onSubmit: SubmitHandler<CafeSubmissionFormData> = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Cafe Submission Data:", data);
    toast({
      title: "Submission Received!",
      description: `${data.name} has been submitted for review. Thank you!`,
    });
    reset();
    if (onFormSubmit) {
      onFormSubmit(); // Call the callback if provided
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-1 pt-0">
        <CardTitle>Submit a New Matcha Cafe</CardTitle>
        <CardDescription>Help us grow the MatchaMe directory! Fill in the details below.</CardDescription>
      </CardHeader>
      <CardContent className="px-1 pb-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto pr-3">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Cafe Name</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
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
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <Textarea id="address" {...register("address")} className="mt-1" />
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" step="any" {...register("latitude")} className="mt-1" placeholder="e.g., 3.1390"/>
              {errors.latitude && <p className="text-xs text-destructive mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" step="any" {...register("longitude")} className="mt-1" placeholder="e.g., 101.6869"/>
              {errors.longitude && <p className="text-xs text-destructive mt-1">{errors.longitude.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="openingHours">Opening Hours</Label>
            <Input id="openingHours" {...register("openingHours")} className="mt-1" placeholder="e.g., 10 AM - 10 PM Daily"/>
            {errors.openingHours && <p className="text-xs text-destructive mt-1">{errors.openingHours.message}</p>}
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" {...register("tags")} className="mt-1" placeholder="e.g., Work Friendly, Quiet, Best Matcha Latte" />
            {errors.tags && <p className="text-xs text-destructive mt-1">{errors.tags.message}</p>}
          </div>

          <h3 className="text-md font-semibold pt-2 border-t">Optional Links</h3>

          <div>
            <Label htmlFor="menuLink">Menu Link (URL)</Label>
            <Input id="menuLink" type="url" {...register("menuLink")} className="mt-1" placeholder="https://..." />
            {errors.menuLink && <p className="text-xs text-destructive mt-1">{errors.menuLink.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="image">Image Link (URL)</Label>
            <Input id="image" type="url" {...register("image")} className="mt-1" placeholder="https://placehold.co/600x400.png" />
            {errors.image && <p className="text-xs text-destructive mt-1">{errors.image.message}</p>}
          </div>

          <div>
            <Label htmlFor="websiteLink">Website Link (URL)</Label>
            <Input id="websiteLink" type="url" {...register("websiteLink")} className="mt-1" placeholder="https://..." />
            {errors.websiteLink && <p className="text-xs text-destructive mt-1">{errors.websiteLink.message}</p>}
          </div>

          <div>
            <Label htmlFor="instagramLink">Instagram Link (URL)</Label>
            <Input id="instagramLink" type="url" {...register("instagramLink")} className="mt-1" placeholder="https://instagram.com/..." />
            {errors.instagramLink && <p className="text-xs text-destructive mt-1">{errors.instagramLink.message}</p>}
          </div>

          <div>
            <Label htmlFor="facebookLink">Facebook Link (URL)</Label>
            <Input id="facebookLink" type="url" {...register("facebookLink")} className="mt-1" placeholder="https://facebook.com/..." />
            {errors.facebookLink && <p className="text-xs text-destructive mt-1">{errors.facebookLink.message}</p>}
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Cafe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
