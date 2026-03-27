# BarberLink Level 3 Operation Guide 🚀🌏

Your platform is now a **Level 3 Global AI SaaS**. It operates as an autonomous business entity with specialized agents and institutional-grade modules.

## 1. 🧠 AI Business Brain (Admin Hub)
Located in the `Admin Dashboard > AI Agents`, this system manages 10 specialized agents.
- **Seeding:** On first access, the system automatically seeds Firestore with the AI Agent Registry.
- **Tasks:** Each agent (Stylist, Marketing, Support) has dynamic boundaries and memory types defined in `src/ai-agents/AgentRegistry.ts`.

## 2. 💸 Global Revenue Engine
- **Multi-Currency:** Support for DZD, USD, EUR, and GBP is fully integrated.
- **Commissions:** The system tracks a 10% auto-deduction on online payments (Stripe/PayPal ready).
- **Referrals:** Barbers can invite others to earn bonuses (500 DZD default). Referral codes are generated automatically on registration.

## 3. ✂️ Autonomous Salon Management
Barbers (Salon Owners) now have a full **Staff Management** tab:
- Add multiple barbers/stylists to a single salon.
- **Booking Flow:** Customers can now pick a "Preferred Barber" or auto-assign.
- **Multi-Service:** The booking engine calculates total duration and price for multiple services in one slot, preventing scheduling overlaps.

## 4. 📈 Investor Strategic Hub
The `/investors` page is a premium portal designed for institutional partners.
- **Data Sync:** Admins can push real-time growth metrics (Revenue, Active Barbers, AI Efficiency) from the Admin Dashboard to the Investor Hub.

## 5. 🛠️ Production Stability (Worker & Tests)
- **Notification Worker:** `scripts/NotificationWorker.cjs` uses Redis (BullMQ) to handle non-blocking emails and Telegram alerts.
- **Testing:** Run `npx jest` to execute the `tests/Booking.test.ts` suite. This verifies that booking calculations are accurate across all currencies.

## ⚡ Next Scaling Steps
1. **VPS Deployment:** Deploy the `NotificationWorker.cjs` as a background process using `pm2`.
2. **Payment Hub:** Connect your Stripe/PayPal keys in `AdminDashboard > Settings`.
3. **Global Marketing:** Use the **Marketing Agent** in the registry to generate localized promotional content for the Algerian (DZD) and French markets.

**BarberLink is now ready to dominate the global grooming market.**
