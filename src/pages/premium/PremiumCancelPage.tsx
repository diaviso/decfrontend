import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PremiumCancelPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card className="max-w-md w-full border border-[#D1DDD6] dark:border-[#2D3F35] bg-white dark:bg-[#141F1A]">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#5A7265]/10"
          >
            <XCircle className="h-10 w-10 text-[#5A7265]" />
          </motion.div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#1A2E23] dark:text-[#E8F0EC]">
              Paiement annulé
            </h1>
            <p className="text-[#5A7265] dark:text-[#8BA898] mt-2">
              Votre paiement n'a pas été effectué
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-[#5A7265] dark:text-[#8BA898]">
            Pas de souci ! Vous pouvez réessayer à tout moment. 
            Nos quiz premium vous attendent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              className="w-full bg-[#1B5E3D] hover:bg-[#144832] text-white"
              onClick={() => navigate('/premium')}
            >
              <Crown className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
