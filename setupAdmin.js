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

async function setupDatabase() {
    console.log("Starting Database Setup...");

    // 1. Setup Admin User
    const adminEmail = 'admin@gmail.com';
    let adminUid = '';

    try {
        const userRecord = await auth.getUserByEmail(adminEmail);
        adminUid = userRecord.uid;
        console.log(`Admin user already exists in Auth: ${adminUid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            const newUser = await auth.createUser({
                email: adminEmail,
                password: 'AdminPassword123!',
                displayName: 'Super Admin',
                emailVerified: true
            });
            adminUid = newUser.uid;
            console.log(`Created new Admin user in Auth: ${adminUid}`);
        } else {
            console.error("Error fetching user:", error);
            return;
        }
    }

    // Set Claims if needed
    await auth.setCustomUserClaims(adminUid, { admin: true });

    // Update Firestore users table
    await db.collection('users').doc(adminUid).set({
        id: adminUid,
        email: adminEmail,
        full_name: 'Admin',
        role: 'admin',
        created_at: new Date().toISOString()
    }, { merge: true });
    console.log("Admin Firestore document configured successfully.");

    // 2. Setup AI Agents (Prompts & Settings)
    const aiPromptsRef = db.collection('system_settings').doc('ai_prompts');
    await aiPromptsRef.set({
        customer_service: 'أنت وكيل خدمة عملاء ذكي في منصة BarberLink الجزائرية. هدفك هو مساعدة الزبائن بلطف في الحجز والإجابة عن استفساراتهم حول الصالونات والأسعار بلهجة محترمة وواضحة.',
        social_media: 'أنت وكيل تسويق لـ BarberLink. قم بصياغة نصوص تسويقية جذابة للصالونات الجزائرية لنشرها على إنستجرام وفيسبوك، باستخدام مزيج مناسب من العربية الفصحى والدارجة المفهومة.',
        reports_generator: 'أنت مراجع مالي للمنصة. قم بتلخيص بيانات الحجز والأرباح لأصحاب الصالونات بصيغة تقارير دورية احترافية وسهلة الفهم.',
        subscription_bot: 'أنت وكيل التنبيهات. تواصل مع أصحاب الصالونات لتذكيرهم بتجديد اشتراكاتهم بأسلوب احترافي يحث على المتابعة وتوضيح المزايا المفقودة عند عدم التجديد.'
    }, { merge: true });
    console.log("AI Agents prompts & instructions configured.");

    // 3. Setup General API settings
    const apiKeysRef = db.collection('system_settings').doc('api_keys');
    await apiKeysRef.set({
        openai: '',
        stripe: '',
        telegramToken: '',
        weatherKey: '',
        nominatimUrl: 'https://nominatim.openstreetmap.org/search',
        other: ''
    }, { merge: true });

    const pricingRef = db.collection('system_settings').doc('pricing');
    await pricingRef.set({
        basic: 1000,
        pro: 1500,
        premium: 2000
    }, { merge: true });

    console.log("System Settings tables initialized.");

    console.log("\\n===========================================");
    console.log("Database & Agents Setup Completed Successfully!");
    console.log("You can now login as Admin with:");
    console.log("Email: admin@gmail.com");
    console.log("Password: AdminPassword123!");
    console.log("===========================================\\n");
}

setupDatabase().catch(console.error);
