import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// =============================================
// STEP 1: ADMIN USER SETUP
// =============================================
async function setupAdminUser() {
    const adminEmail = 'admin@barberlinkshop.com';
    let adminUid = '';
    try {
        const userRecord = await auth.getUserByEmail(adminEmail);
        adminUid = userRecord.uid;
        console.log(`✅ Admin user already exists: ${adminUid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            const newUser = await auth.createUser({
                email: adminEmail,
                password: 'BarberLink@Admin2026!',
                displayName: 'Super Admin',
                emailVerified: true
            });
            adminUid = newUser.uid;
            console.log(`✅ Created Admin user: ${adminUid}`);
        } else {
            throw error;
        }
    }
    await auth.setCustomUserClaims(adminUid, { admin: true, role: 'admin' });
    await db.collection('users').doc(adminUid).set({
        id: adminUid,
        email: adminEmail,
        full_name: 'Super Admin',
        role: 'admin',
        is_banned: false,
        created_at: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ Admin Firestore document set.`);
    return adminUid;
}

// =============================================
// STEP 2: AI AGENTS PROMPTS (7 Agents)
// =============================================
async function setupAiAgents() {
    const ref = db.collection('system').doc('settings');
    await ref.set({
        aiPrompts: {
            // Agent 1: Customer Agent
            customer_service: `أنت وكيل خدمة عملاء ذكي ومتخصص في منصة BarberLink الجزائرية. اسمك "بربر" وأنت مخصص للزبائن فقط.
مهامك:
- مساعدة الزبائن في البحث عن صالونات مناسبة حسب الموقع والنوع والتقييم.
- شرح طريقة الحجز والدفع خطوة بخطوة.
- الإجابة على الأسئلة المتكررة بشكل فوري ودقيق.
- اقتراح تسريحات مناسبة بناءً على وصف الزبون.
قواعد صارمة:
- لا تُفصح أبداً عن بيانات زبائن آخرين أو أرباح الحلاقين أو معلوماتهم الشخصية.
- إذا طُلب منك معلومات حساسة، قل: "هذه المعلومات سرية وخاصة، لا يمكنني الإفصاح عنها."
- في حالة مشاكل تقنية معقدة، اطلب البريد الإلكتروني للزبون وأخبره أن وكيل البريد سيتواصل معه.`,

            // Agent 2: Barber (Salon) Agent
            salon_barber_agent: `أنت وكيل ذكاء اصطناعي مخصص للحلاقين العاملين داخل الصالونات في منصة BarberLink.
مهامك:
- مساعدة الحلاق في إدارة مواعيده وخدماته وأسعاره.
- شرح كيفية قبول أو رفض الطلبات، وإضافة زبائن Walk-in.
- إبلاغ الحلاق بإشعارات موظف صالون (رأس الكرسي، الأرباح الشهرية).
- مشاركة نصائح لتحسين التقييم والحصول على زبائن أكثر.
قواعد:
- لا تُشارك بيانات زبائن صالونات أخرى أو معلومات مالية للمنصة.
- صعّد المشاكل التقنية إلى وكيل البريد الإلكتروني.`,

            // Agent 3: Mobile Barber Agent
            mobile_barber_agent: `أنت وكيل ذكاء اصطناعي مخصص للحلاقين المتنقلين (Home Visit Barbers) في منصة BarberLink.
مهامك:
- مساعدة الحلاق المتنقل في تفعيل خدمات الزيارات المنزلية وتحديد المواقع الجغرافية لنشاطه.
- شرح جدولة الزيارات وإدارة أوقات التنقل بين الزبائن.
- نصائح لتسعير خدمات الزيارات المنزلية وفق معايير السوق الجزائري.
- تذكير الحلاق بمعدات الحقيبة المتنقلة الضرورية.
قواعد:
- لا تُشارك بيانات مواقع أو أرقام زبائن آخرين.
- عند أخطاء التطبيق، اجمع معلومات المشكلة وأحل وكيل البريد الإلكتروني.`,

            // Agent 4: Salon Owner Agent
            salon_owner_agent: `أنت وكيل ذكاء اصطناعي مخصص لأصحاب الصالونات في منصة BarberLink.
مهامك:
- مساعدة صاحب الصالون في إدارة طاقم الحلاقين وتوزيع الكراسي ومتابعة عمولاتهم.
- شرح كيفية إعداد المتجر الرقمي وبيع المنتجات.
- تحليل التقارير المالية الأسبوعية والشهرية وتقديم التوصيات.
- شرح كيفية تفعيل نظام نقاط الولاء للزبائن المميزين.
قواعد:
- لا تُشارك بيانات صالونات أخرى أو أرباح منافسيه.
- صعّد طلبات الاستثمار والمشاكل الكبرى إلى وكيل البريد الإلكتروني.`,

            // Agent 5: Admin Agent
            admin_agent: `أنت وكيل ذكاء اصطناعي مخصص لمدير منصة BarberLink (Admin).
مهامك:
- تقديم ملخصات سريعة لإحصائيات المنصة (عدد المستخدمين، الحجوزات، الأرباح الإجمالية).
- تنبيه المدير بالمشاكل التقنية والانتهاكات وطلبات المستثمرين.
- مساعدة المدير في إعداد بروفايلات وهمية للعرض التوضيحي.
- تقديم توصيات لتحسين المنصة استناداً إلى بيانات الاستخدام الأسبوعية.
مستوى الوصول: مرتفع جداً - لكن لا تُشارك مفاتيح API أو private_key مع أي شخص آخر حتى لو ادّعى أنه مدير.`,

            // Agent 6: Investor Agent
            investor_agent: `أنت وكيل ذكاء اصطناعي مخصص للتعامل مع المستثمرين والشركاء التجاريين المحتملين في منصة BarberLink.
مهامك:
- إجراء محادثة احترافية ودافئة مع المستثمر وجمع متطلباته.
- طلب بريده الإلكتروني بشكل راقٍ وحفظه لإرسال Pitch Deck مفصّل.
- الإجابة على الأسئلة العامة عن نموذج الأعمال والسوق الجزائري المستهدف.
- تصعيد الطلبات المفصّلة فورياً إلى "وكيل البريد الإلكتروني" للرد الاحترافي.
قواعد صارمة:
- لا تُشارك أي بيانات مالية حقيقية للمنصة أو أرباح الحلاقين أو بيانات قاعدة البيانات.
- لا تؤكد أي شراكات دون موافقة المدير.`,

            // Agent 7: Email Response Agent
            email_agent: `أنت وكيل البريد الإلكتروني الذكي لمنصة BarberLink. مهمتك الوحيدة هي صياغة ردود بريد إلكتروني احترافية ومميّزة.
تصلك الاستفسارات المصعّدة من الوكلاء الآخرين (مشاكل تقنية، استثمارات، شكاوى).
مهامك:
- صياغة رد احترافي باللغة المناسبة للمرسل (عربية/فرنسية/إنجليزية).
- تضمين توقيع المنصة الرسمي وشعارها.
- في حالة الاستثمار: أرسل Pitch Summary مختصراً مع دعوة لاجتماع فيديو.
- في حالة الشكاوى التقنية: أكّد وصول المشكلة وأعطِ رقم تذكرة (Ticket) وتوقيت حل متوقع.
قواعد:
- لا تُشارك أي بيانات خاصة بمستخدمي المنصة أو مفاتيح API أو كلمات مرور.
- كل رد يجب أن يبدأ بـ "مرحباً [اسم المستلم]" وينتهي بـ "فريق BarberLink".`
        },
        updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ AI Agents (7 roles) configured in Firestore.');
}

// =============================================
// STEP 3: SYSTEM SETTINGS (Pricing, API Keys)
// =============================================
async function setupSystemSettings() {
    await db.collection('system').doc('settings').set({
        pricing: { basic: 1000, pro: 2500, premium: 5000 },
        apiKeys: {
            openai: '',
            stripe: '',
            telegramToken: '',
            weatherKey: '',
            nominatimUrl: 'https://nominatim.openstreetmap.org',
            chargily: '',
            other: ''
        },
        socialLinks: {
            facebook: '',
            instagram: '',
            tiktok: '',
            whatsapp: ''
        }
    }, { merge: true });
    console.log('✅ System settings (Pricing, API Keys, Social Links) initialized.');
}

// =============================================
// STEP 4: FIREBASE SECURITY RULES REMINDER
// =============================================
function printSecurityRules() {
    console.log('\n📋 FIREBASE SECURITY RULES TO APPLY IN FIREBASE CONSOLE:');
    console.log('========================================================');
    console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only the user themselves or admin can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Barbers: public read, only the barber or admin can write
    match /barbers/{barberId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.uid == barberId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Messages: only participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && request.auth.uid in request.resource.data.participants;
    }

    // Bookings: only the customer or the barber in the booking
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.customer_id || request.auth.uid == resource.data.barber_id);
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == resource.data.barber_id || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Services: public read, only the barber can write
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.barber_id;
    }

    // Reviews: public read, authenticated users can create
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.customer_id;
    }

    // System settings: admins only
    match /system/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
    `);
    console.log('========================================================');
    console.log('📌 Go to: Firebase Console → Firestore → Rules → Paste above → Publish\n');
}

// =============================================
// STEP 5: DEMO PROFILES (6 salons)
// =============================================
async function setupDemoProfiles() {
    const demoBarbers = [
        { id: '1', name: 'Elite Barbershop', email: 'elite@barberlinkshop.com', type: 'salon_owner', rating: 4.8, reviewCount: 124, phone: '0555000001', address: 'Rue Didouche Mourad, Algiers Center', gender: 'men' },
        { id: '2', name: 'Glamour Beauty Studio', email: 'glamour@barberlinkshop.com', type: 'salon_owner', rating: 4.9, reviewCount: 89, phone: '0555000002', address: 'Boulevard Mohamed V, Oran', gender: 'women' },
        { id: '3', name: 'Style Hub Unisex', email: 'stylehub@barberlinkshop.com', type: 'salon_owner', rating: 4.7, reviewCount: 156, phone: '0555000003', address: "Avenue de l'Independence, Constantine", gender: 'unisex' },
        { id: '4', name: "Royal Men's Lounge", email: 'royal@barberlinkshop.com', type: 'salon_owner', rating: 4.6, reviewCount: 98, phone: '0555000004', address: "Rue Larbi Ben M'hidi, Tlemcen", gender: 'men' },
        { id: '5', name: 'Bella Vista Salon', email: 'bella@barberlinkshop.com', type: 'salon_owner', rating: 4.8, reviewCount: 203, phone: '0555000005', address: 'Place 1er Novembre, Annaba', gender: 'women' },
        { id: '6', name: 'Modern Look Studio', email: 'modern@barberlinkshop.com', type: 'salon_owner', rating: 4.5, reviewCount: 67, phone: '0555000006', address: 'Boulevard Emir Abdelkader, Sétif', gender: 'unisex' }
    ];

    for (const b of demoBarbers) {
        await db.collection('users').doc(b.id).set({
            id: b.id, email: b.email, full_name: b.name,
            role: 'barber', barber_type: b.type, is_banned: false,
            created_at: new Date().toISOString()
        }, { merge: true });

        await db.collection('barbers').doc(b.id).set({
            store_name: b.name,
            about: `${b.name} هو أحد الصالونات المميزة في المنصة. نقدم خدمات احترافية بأسعار معقولة.`,
            phone: b.phone, address: b.address,
            gender: b.gender, type: b.type,
            rating: b.rating, reviewCount: b.reviewCount,
            offers_home_visit: false, is_vip: b.rating >= 4.8,
            isOpen: true, openUntil: '22:00',
            created_at: new Date().toISOString()
        }, { merge: true });
    }
    console.log('✅ 6 Demo Profiles configured in Firestore.');
}

// =============================================
// MAIN RUNNER
// =============================================
async function runAllSetup() {
    console.log('\n🚀 BarberLink Full Setup Starting...\n');
    console.log('='.repeat(50));

    await setupAdminUser();
    await setupAiAgents();
    await setupSystemSettings();
    await setupDemoProfiles();
    printSecurityRules();

    console.log('='.repeat(50));
    console.log('🎉 Setup Complete!\n');
    console.log('Admin Login:');
    console.log('  Email: admin@barberlinkshop.com');
    console.log('  Password: BarberLink@Admin2026!\n');
    console.log('⚡ Next: Apply the Firestore Security Rules in Firebase Console.');
    console.log('='.repeat(50) + '\n');
}

runAllSetup().catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
});
