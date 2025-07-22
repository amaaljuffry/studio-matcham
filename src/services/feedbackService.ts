import { supabase } from '@/lib/supabaseClient'; // Adjust this path to your Supabase client instance

interface FeedbackData {
  name?: string;
  email?: string;
  feedback_message: string;
}

export async function sendFeedback(data: FeedbackData): Promise<boolean> {
  console.log('Sending feedback:', data);
  try {
    const { error } = await supabase
      .from('feedback')
      .insert({
        name: data.name || null,
        email: data.email || null,
        feedback_message: data.feedback_message,
      });

    if (error) {
      console.error('Error inserting feedback:', error);
      return false;
    }

    console.log('Feedback submitted successfully!');
    return true;
  } catch (error) {
    console.error('Exception during feedback submission:', error);
    return false;
  }
} 