import { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Trophy,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

const stripePromise = loadStripe('pk_test_51StYtQBERrtf4ZWpK0qQ0wthzHSX7vDsQ9Z5ZwzkGrwEuNunYvWookV3lUdfkkX88EzBTtDrBWZWngCkrcFmXO1u00HPBL9tRw');

const features = [
  {
    icon: Trophy,
    title: 'Accès aux quiz premium',
    description: 'Débloquez tous les quiz avancés et spécialisés',
  },
  {
    icon: Zap,
    title: 'Tentatives illimitées',
    description: 'Réessayez autant de fois que vous le souhaitez',
  },
  {
    icon: Star,
    title: 'Étoiles bonus',
    description: 'Gagnez 2x plus d\'étoiles sur chaque quiz',
  },
  {
    icon: Shield,
    title: 'Support prioritaire',
    description: 'Assistance dédiée pour vos questions',
  },
];

export function PremiumPage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isPremium = (user as any)?.isPremium;
  const premiumExpiresAt = (user as any)?.premiumExpiresAt;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/stripe/create-payment', {
        amount: 999, // 9.99 EUR
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#D4890A] mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
          Passez à Premium
        </h1>
        <p className="text-[#5A7265] dark:text-[#8BA898] mt-2 text-lg">
          Débloquez tout le potentiel de DEC Learning
        </p>
      </motion.div>

      {/* Current Status */}
      {isPremium && (
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-[#F5A623] bg-[#F5A623]/5">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-[#F5A623]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A2E23] dark:text-[#E8F0EC]">
                      Vous êtes Premium !
                    </h3>
                    <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">
                      Expire le {premiumExpiresAt ? new Date(premiumExpiresAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#F5A623] text-white">Actif</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-2 border-[#1B5E3D] dark:border-[#3D9A6A] bg-white dark:bg-[#141F1A]">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1B5E3D] via-[#F5A623] to-[#3D9A6A]" />
          
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <Badge className="bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Offre spéciale
              </Badge>
            </div>
            <CardTitle className="text-2xl text-[#1A2E23] dark:text-[#E8F0EC]">
              Abonnement Premium
            </CardTitle>
            <CardDescription className="text-[#5A7265] dark:text-[#8BA898]">
              Accès complet pendant 1 mois
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price */}
            <div className="text-center py-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-[#1B5E3D] dark:text-[#3D9A6A]">9,99</span>
                <span className="text-2xl text-[#5A7265] dark:text-[#8BA898]">€</span>
              </div>
              <p className="text-sm text-[#5A7265] dark:text-[#8BA898] mt-1">par mois</p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#1B5E3D]/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#1B5E3D] dark:text-[#3D9A6A]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A2E23] dark:text-[#E8F0EC]">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#1B5E3D] to-[#2D7A50] hover:from-[#144832] hover:to-[#1B5E3D] text-white text-lg py-6"
              onClick={handleSubscribe}
              disabled={isLoading || isPremium}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Chargement...
                </>
              ) : isPremium ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Déjà Premium
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-5 w-5" />
                  S'abonner maintenant
                </>
              )}
            </Button>

            {/* Security note */}
            <p className="text-center text-xs text-[#5A7265] dark:text-[#8BA898]">
              <Shield className="inline h-3 w-3 mr-1" />
              Paiement sécurisé par Stripe
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ or additional info */}
      <motion.div variants={itemVariants} className="text-center text-sm text-[#5A7265] dark:text-[#8BA898]">
        <p>
          Des questions ? Contactez-nous à{' '}
          <a href="mailto:support@declearning.com" className="text-[#1B5E3D] dark:text-[#3D9A6A] hover:underline">
            support@declearning.com
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
