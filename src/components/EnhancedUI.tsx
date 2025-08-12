'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Star, 
  TrendingUp, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Enhanced Toast Notification
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export function EnhancedToast({ type, title, message, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            {message && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Progress Indicator
interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function ProgressIndicator({ 
  current, 
  total, 
  label, 
  showPercentage = true, 
  variant = 'default' 
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const getVariantColors = () => {
    switch (variant) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          {showPercentage && (
            <span className="font-medium text-gray-900 dark:text-white">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getVariantColors()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{current} of {total}</span>
        <span>{Math.round(percentage)}% complete</span>
      </div>
    </div>
  );
}

// Enhanced Status Badge
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error';
  label?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: <Clock className="w-3 h-3" />
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: <Clock className="w-3 h-3" />
        };
      case 'completed':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'error':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {showIcon && config.icon}
      <span>{label || status}</span>
    </Badge>
  );
}

// Enhanced Collapsible Section
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export function CollapsibleSection({ title, children, defaultOpen = false, icon }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Enhanced Feature Card
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: 'available' | 'coming-soon' | 'premium';
  onClick?: () => void;
}

export function FeatureCard({ title, description, icon, status = 'available', onClick }: FeatureCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          color: 'border-green-200 dark:border-green-800',
          badge: <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Available</Badge>
        };
      case 'coming-soon':
        return {
          color: 'border-yellow-200 dark:border-yellow-800',
          badge: <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Coming Soon</Badge>
        };
      case 'premium':
        return {
          color: 'border-purple-200 dark:border-purple-800',
          badge: <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Premium</Badge>
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card 
      className={`${config.color} transition-all duration-200 hover:shadow-md cursor-pointer ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {icon}
          </div>
          {config.badge}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

// Enhanced Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

export function LoadingSpinner({ size = 'md', text, variant = 'default' }: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const getVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'pulse':
        return <div className={`${getSize()} bg-blue-500 rounded-full animate-pulse`}></div>;
      default:
        return <div className={`${getSize()} border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {getVariant()}
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}
