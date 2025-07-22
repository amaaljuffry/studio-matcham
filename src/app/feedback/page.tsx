"use client";


import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sendFeedback } from '@/services/feedbackService';
import { Loader2 } from 'lucide-react';

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  feedback_message: z.string().min(10, { message: "Feedback message must be at least 10 characters." }),
});

type FeedbackFormZodData = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FeedbackFormZodData>({
    resolver: zodResolver(feedbackSchema),
  });
  const { toast } = useToast();

  const onSubmit = async (data: FeedbackFormZodData) => {
    const success = await sendFeedback(data);
    if (success) {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
        duration: 3000,
      });
      reset();
    } else {
      toast({
        title: "Feedback Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Send Us Your Feedback</CardTitle>
          <CardDescription className="text-muted-foreground">Your thoughts help us improve!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground">
            We appreciate your feedback! Please use the form below to share your suggestions, ideas, or report any issues.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name (Optional)</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Your Email (Optional)</Label>
              <Input id="email" {...register("email")} type="email" placeholder="your.email@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="feedback_message">Your Feedback</Label>
              <Textarea id="feedback_message" {...register("feedback_message")} placeholder="Tell us what you think..." rows={5} required />
              {errors.feedback_message && <p className="text-xs text-destructive mt-1">{errors.feedback_message.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Feedback
            </Button>
          </form>
          <div className="text-center pt-4">
            <Link href="/" passHref>
              <Button variant="outline" className="flex items-center mx-auto">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 