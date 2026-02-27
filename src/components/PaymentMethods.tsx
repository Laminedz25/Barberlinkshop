import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Clock,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  available: boolean;
}

interface PaymentMethodsProps {
  onSelectPayment?: (method: string) => void;
  selectedPayment?: string;
}

const PaymentMethods = ({ onSelectPayment, selectedPayment = 'after_service' }: PaymentMethodsProps) => {
  const { t } = useLanguage();
  
  const handleSelectMethod = (methodId: string) => {
    if (onSelectPayment) {
      onSelectPayment(methodId);
    }
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'after_service',
      name: t('payment.after'),
      icon: <DollarSign className="h-6 w-6" />,
      description: t('payment.after.desc'),
      badge: 'No fees',
      available: true
    },
    {
      id: 'baridi_mob',
      name: t('payment.baridi'),
      icon: <Smartphone className="h-6 w-6" />,
      description: t('payment.baridi.desc'),
      badge: 'Popular',
      available: true
    },
    {
      id: 'visa',
      name: t('payment.visa'),
      icon: <CreditCard className="h-6 w-6" />,
      description: t('payment.card.desc'),
      available: true
    },
    {
      id: 'mastercard',
      name: t('payment.mastercard'),
      icon: <CreditCard className="h-6 w-6" />,
      description: t('payment.card.desc'),
      available: true
    },
    {
      id: 'paypal',
      name: t('payment.paypal'),
      icon: <CreditCard className="h-6 w-6" />,
      description: t('payment.paypal.desc'),
      available: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('payment.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id)}
                disabled={!method.available}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedPayment === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            } ${!method.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedPayment === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {method.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {method.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {method.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              {selectedPayment === method.id && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;