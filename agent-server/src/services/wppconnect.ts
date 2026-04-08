import * as wppconnect from '@wppconnect-team/wppconnect';

export class WPPManager {
  private static instance: WPPManager;
  private client: wppconnect.Whatsapp | null = null;
  public qrCodeBase64: string = '';

  public static getInstance(): WPPManager {
    if (!WPPManager.instance) {
      WPPManager.instance = new WPPManager();
    }
    return WPPManager.instance;
  }

  public async startGlobalClient() {
    console.log('[WPPManager] Spawning WhatsApp Global Core...');
    try {
      this.client = await wppconnect.create({
        session: 'barberlink-global-bot',
        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
          console.log('[WPPManager] Pending QR Scan:', attempts);
          this.qrCodeBase64 = base64Qrimg;
        },
        statusFind: (statusSession, session) => {
          console.log('[WPPManager] Session Status:', statusSession);
        },
        headless: true,
      });
      console.log('[WPPManager] Global Client Started.');
      this.registerEvents();
    } catch (e: any) {
      console.log('[WPPManager] Could not initialize WPP:', e.message);
    }
  }

  private registerEvents() {
    if(!this.client) return;
    
    // Auto Response Logic
    this.client.onMessage(async (message) => {
      if (!message || !message.body) return;
      if (message.body.toLowerCase() === 'hello' || message.body.toLowerCase() === 'مرحبا') {
        const reply = `مرحباً بك في صالوننا! 💈✨ نحن نستخدم تقنيات BarberLink.\nللحجز السريع، تفضل بزيارة: https://barberlink.cloud`;
        await this.client?.sendText(message.from, reply);
      }
    });
  }

  public async sendBookingConfirmation(number: string, details: string) {
    if(!this.client) return false;
    const formattedNum = `${number}@c.us`; // simple assumption
    await this.client.sendText(formattedNum, details);
    return true;
  }
}
