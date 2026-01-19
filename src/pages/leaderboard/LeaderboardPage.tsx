import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Loader2,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { LeaderboardEntry, UserPosition } from '@/types';

export function LeaderboardPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, positionRes] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/me'),
        ]);
        setLeaderboard(leaderboardRes.data);
        setUserPosition(positionRes.data);
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le classement',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 border-gray-300 dark:border-gray-700';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-card hover:bg-muted/50';
    }
  };

  const isUserInTop100 = userPosition && userPosition.rank <= 100;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
        </div>
        <p className="mt-4 text-muted-foreground">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Classement
        </h1>
        <p className="text-muted-foreground mt-1">
          Les 100 meilleurs utilisateurs par nombre d'étoiles
        </p>
      </motion.div>

      {/* User Position Card (if not in top 100) */}
      {userPosition && !isUserInTop100 && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Votre position</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {userPosition.rank}
                    <span className="text-base font-normal text-muted-foreground">
                      {userPosition.rank === 1 ? 'er' : 'ème'}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {userPosition.stars} étoiles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="mt-8">
            <Card className={cn('border-2', getRankStyle(2))}>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-slate-300 dark:from-gray-700 dark:to-slate-600 flex items-center justify-center mb-3">
                  <Medal className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-500">2</p>
                <p className="font-semibold truncate">
                  {leaderboard[1].firstName} {leaderboard[1].lastName.charAt(0)}.
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[1].stars}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 1st Place */}
          <div>
            <Card className={cn('border-2 shadow-lg', getRankStyle(1))}>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700 flex items-center justify-center mb-3 shadow-lg">
                  <Crown className="h-10 w-10 text-yellow-700 dark:text-yellow-200" />
                </div>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">1</p>
                <p className="font-semibold truncate text-lg">
                  {leaderboard[0].firstName} {leaderboard[0].lastName.charAt(0)}.
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[0].stars}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="mt-12">
            <Card className={cn('border-2', getRankStyle(3))}>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center mb-3">
                  <Medal className="h-7 w-7 text-amber-700 dark:text-amber-300" />
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">3</p>
                <p className="font-semibold truncate">
                  {leaderboard[2].firstName} {leaderboard[2].lastName.charAt(0)}.
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {leaderboard[2].stars}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top 100
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun utilisateur dans le classement</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userId === user?.id;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                        isCurrentUser
                          ? 'border-primary bg-primary/5'
                          : getRankStyle(entry.rank)
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                        entry.rank <= 3
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                          : 'bg-muted'
                      )}>
                        {getRankIcon(entry.rank) || entry.rank}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold truncate',
                          isCurrentUser && 'text-primary'
                        )}>
                          {entry.firstName} {entry.lastName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Vous
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rang #{entry.rank}
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">
                          {entry.stars}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
