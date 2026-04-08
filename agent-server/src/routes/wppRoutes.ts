import { Router } from 'express';
import { WPPManager } from '../services/wppconnect';

export const wppRouter = Router();

wppRouter.get('/status', (req, res) => {
  res.json({
    status: WPPManager.getInstance().qrCodeBase64 ? 'QR_PENDING' : 'READY',
    qr: WPPManager.getInstance().qrCodeBase64
  });
});

wppRouter.post('/send', async (req, res) => {
  const { number, details } = req.body;
  if(!number || !details) return res.status(400).json({ error: 'Missing parameters' });
  
  const success = await WPPManager.getInstance().sendBookingConfirmation(number, details);
  res.json({ success });
});
