import React from 'react';
import {
  Car,
  Heart,
  Users,
  User,
  Home,
  Utensils,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Activity,
  Coffee,
  Dumbbell,
  Gift,
  Briefcase,
  Sparkles,
  Book,
  Plane,
  ShieldCheck,
  Award,
  Wallet,
  Tv,
  Smartphone,
  Tag,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  Car,
  Heart,
  Users,
  User,
  Home,
  Utensils,
  ShoppingBag,
  Receipt,
  TrendingUp,
  Activity,
  Coffee,
  Dumbbell,
  Gift,
  Briefcase,
  Sparkles,
  Book,
  Plane,
  ShieldCheck,
  Award,
  Wallet,
  Tv,
  Smartphone,
  Tag,
};

export function CategoryIcon({
  name,
  className = 'w-4 h-4',
}: {
  name?: string;
  className?: string;
}) {
  const IconComponent = (name && ICON_MAP[name]) || Tag;
  return <IconComponent className={className} />;
}
