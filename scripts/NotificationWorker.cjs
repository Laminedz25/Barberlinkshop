const { Worker } = require('bullmq');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * BarberLink Global Notification Worker 🔔🛰️
 * Handles: Email, Telegram, and future WhatsApp queues.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new Redis(REDIS_URL);

// 1. Setup Email Transporter (BillionMail/Generic SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.billionmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Notification Processor
const worker = new Worker('notifications', async job => {
  const { type, payload } = job.data;
  console.log(`[Worker] Processing ${type} for job ${job.id}`);

  try {
    switch (type) {
      case 'EMAIL':
        await transporter.sendMail({
          from: `"BarberLink Global" <${process.env.SMTP_USER}>`,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        break;

      case 'TELEGRAM':
        if (process.env.TELEGRAM_BOT_TOKEN) {
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: payload.chatId,
            text: payload.text,
            parse_mode: 'HTML'
          });
        }
        break;

      default:
        console.warn(`[Worker] Unknown notification type: ${type}`);
    }
    return { success: true };
  } catch (err) {
    console.error(`[Worker] Failed job ${job.id}:`, err);
    throw err; // BullMQ will retry based on settings
  }
}, { connection });

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed successfully!`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job.id} failed: ${err.message}`);
});

console.log("🚀 Notification Worker is LIVE and listening to Redis...");
