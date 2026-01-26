import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export function PremiumSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Fetch updated user profile to get premium status
        const response = await api.get('/auth/profile');
        updateUser(response.data);
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      // Small delay to allow webhook to process
      setTimeout(verifyPayment, 2000);
    } else {
      setIsLoading(false);
    }
  }, [sessionId, updateUser]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#1B5E3D] dark:text-[#3D9A6A]" />
        <p className="mt-4 text-[#5A7265] dark:text-[#8BA898]">
          Vérification de votre paiement...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card className="max-w-md w-full border-2 border-[#3D9A6A] bg-white dark:bg-[#141F1A]">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#3D9A6A] to-[#1B5E3D]"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
              Paiement réussi !
            </h1>
            <p className="text-[#5A7265] dark:text-[#8BA898] mt-2">
              Bienvenue dans la famille Premium
            </p>
          </div>

          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5A623]/10 text-[#F5A623]"
          >
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Compte Premium Activé</span>
          </motion.div>

          {/* Description */}
          <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">
            Vous avez maintenant accès à tous les quiz premium et aux fonctionnalités exclusives.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              className="w-full bg-[#1B5E3D] hover:bg-[#144832] text-white"
              onClick={() => navigate('/quizzes')}
            >
              Explorer les quiz premium
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Retour au tableau de bord
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
