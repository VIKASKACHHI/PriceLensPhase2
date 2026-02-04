import { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface ProductReviewDialogProps {
  product: {
    id: string;
    name: string;
    avg_rating: number;
    review_count: number;
  };
  open: boolean;
  onClose: () => void;
}

export function ProductReviewDialog({ product, open, onClose }: ProductReviewDialogProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open, product.id]);

  const fetchReviews = async () => {
    setLoading(true);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      // Fetch user names for reviews
      const reviewsWithNames = await Promise.all(
        reviewsData.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', review.user_id)
            .maybeSingle();

          return {
            ...review,
            user_name: profile?.name || 'Anonymous',
          };
        })
      );

      setReviews(reviewsWithNames);

      // Check if current user has a review
      if (user) {
        const userReview = reviewsWithNames.find((r) => r.user_id === user.id);
        if (userReview) {
          setExistingReview(userReview);
          setUserRating(userReview.rating);
          setUserComment(userReview.comment || '');
        }
      }
    }

    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: userRating,
          comment: userComment.trim() || null,
        })
        .eq('id', existingReview.id);

      if (error) {
        toast.error('Failed to update review');
      } else {
        toast.success('Review updated!');
        fetchReviews();
      }
    } else {
      // Insert new review
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating: userRating,
        comment: userComment.trim() || null,
      });

      if (error) {
        toast.error('Failed to submit review');
      } else {
        toast.success('Review submitted!');
        fetchReviews();
      }
    }

    setSubmitting(false);
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', existingReview.id);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      setExistingReview(null);
      setUserRating(0);
      setUserComment('');
      fetchReviews();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        {/* Overall Rating */}
        <div className="flex items-center gap-3 py-4 border-b">
          <div className="text-3xl font-bold">{product.avg_rating.toFixed(1)}</div>
          <div>
            <StarRating rating={product.avg_rating} size="md" />
            <p className="text-sm text-muted-foreground mt-1">
              {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Add/Edit Review */}
        {user ? (
          <div className="py-4 border-b space-y-4">
            <h3 className="font-medium">
              {existingReview ? 'Your Review' : 'Write a Review'}
            </h3>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your rating</p>
              <StarRating
                rating={userRating}
                size="lg"
                interactive
                onChange={setUserRating}
              />
            </div>
            <Textarea
              placeholder="Share your experience with this product (optional)"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={submitting || userRating === 0}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {existingReview ? 'Update Review' : 'Submit Review'}
              </Button>
              {existingReview && (
                <Button variant="destructive" onClick={handleDeleteReview}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 border-b text-center">
            <p className="text-muted-foreground">Please log in to write a review</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4 py-4">
          <h3 className="font-medium">All Reviews</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
