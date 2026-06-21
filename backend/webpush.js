// webpush.js — configures the web-push library with our VAPID keys.
// VAPID keys let the browser's push service (e.g. Chrome's) verify that
// notifications are genuinely coming from our server, not someone else.
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
