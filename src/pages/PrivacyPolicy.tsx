import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 2025",
      sections: [
        {
          title: "1. Information We Collect",
          content: "We collect information you provide directly to us, such as when you create an account, book an appointment, or contact us for support. This may include your name, email address, phone number, and payment information."
        },
        {
          title: "2. How We Use Your Information",
          content: "We use the information we collect to provide, maintain, and improve our services, process your bookings, communicate with you, and ensure the security of our platform."
        },
        {
          title: "3. Information Sharing",
          content: "We do not sell your personal information. We may share your information with service providers who help us operate our platform, and with salons when you make a booking."
        },
        {
          title: "4. Data Security",
          content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          title: "5. Your Rights",
          content: "You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us directly."
        },
        {
          title: "6. Contact Us",
          content: "If you have any questions about this Privacy Policy, please contact us at privacy@barber.com"
        }
      ]
    },
    fr: {
      title: "Politique de Confidentialité",
      lastUpdated: "Dernière mise à jour : Janvier 2025",
      sections: [
        {
          title: "1. Informations que nous collectons",
          content: "Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, réservez un rendez-vous ou nous contactez pour obtenir de l'aide. Cela peut inclure votre nom, adresse e-mail, numéro de téléphone et informations de paiement."
        },
        {
          title: "2. Comment nous utilisons vos informations",
          content: "Nous utilisons les informations que nous collectons pour fournir, maintenir et améliorer nos services, traiter vos réservations, communiquer avec vous et assurer la sécurité de notre plateforme."
        },
        {
          title: "3. Partage des informations",
          content: "Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations avec des prestataires de services qui nous aident à exploiter notre plateforme et avec des salons lorsque vous effectuez une réservation."
        },
        {
          title: "4. Sécurité des données",
          content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès, la modification, la divulgation ou la destruction non autorisés."
        },
        {
          title: "5. Vos droits",
          content: "Vous avez le droit d'accéder, de mettre à jour ou de supprimer vos informations personnelles. Vous pouvez le faire via les paramètres de votre compte ou en nous contactant directement."
        },
        {
          title: "6. Contactez-nous",
          content: "Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@barber.com"
        }
      ]
    },
    ar: {
      title: "سياسة الخصوصية",
      lastUpdated: "آخر تحديث: يناير 2025",
      sections: [
        {
          title: "1. المعلومات التي نجمعها",
          content: "نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو حجز موعد أو الاتصال بنا للحصول على الدعم. قد يشمل ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك ومعلومات الدفع."
        },
        {
          title: "2. كيف نستخدم معلوماتك",
          content: "نستخدم المعلومات التي نجمعها لتوفير خدماتنا وصيانتها وتحسينها، ومعالجة حجوزاتك، والتواصل معك، وضمان أمن منصتنا."
        },
        {
          title: "3. مشاركة المعلومات",
          content: "نحن لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك مع مقدمي الخدمات الذين يساعدوننا في تشغيل منصتنا، ومع الصالونات عند إجراء حجز."
        },
        {
          title: "4. أمن البيانات",
          content: "نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء أو الإتلاف."
        },
        {
          title: "5. حقوقك",
          content: "لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها. يمكنك القيام بذلك من خلال إعدادات حسابك أو عن طريق الاتصال بنا مباشرة."
        },
        {
          title: "6. اتصل بنا",
          content: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على privacy@barber.com"
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            {currentContent.title}
          </h1>
          <p className="text-muted-foreground mb-8">{currentContent.lastUpdated}</p>

          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <div key={index} className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-semibold mb-3 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
