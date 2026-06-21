// cron.js — three scheduled jobs that send push notifications based on
// each user's actual task state, not just a blind blast to everyone.
// Times are in Asia/Kolkata for now (the app's initial audience); for a
// wider rollout you'd store each user's timezone and schedule per-user.
const cron = require('node-cron');
const pool = require('./db');
const webpush = require('./webpush');

async function sendToUser(userId, payload) {
  const { rows: subs } = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [userId]);
  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err) {
      // 410 Gone means the browser unsubscribed (e.g. cleared site data) — clean it up.
      if (err.statusCode === 410 || err.statusCode === 404) {
        await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
      } else {
        console.error('Push failed for user', userId, err.message);
      }
    }
  }
}

// 8:00 AM — users with zero tasks logged yet today get a planning prompt.
cron.schedule('0 8 * * *', async () => {
  const { rows } = await pool.query(`
    SELECT u.id, u.name FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM tasks t WHERE t.user_id = u.id AND t.task_date = CURRENT_DATE
    )
  `);
  for (const user of rows) {
    await sendToUser(user.id, {
      title: `Good morning, ${user.name.split(' ')[0]} ☀️`,
      body: "Before the day takes over — what's on your mind today? Add it before it slips away.",
    });
  }
}, { timezone: 'Asia/Kolkata' });

// 6:00 PM — users with incomplete tasks get a friendly progress nudge.
cron.schedule('0 18 * * *', async () => {
  const { rows } = await pool.query(`
    SELECT u.id, u.name,
           COUNT(t.*) AS total,
           COUNT(t.*) FILTER (WHERE t.completed) AS done
    FROM users u
    JOIN tasks t ON t.user_id = u.id AND t.task_date = CURRENT_DATE
    GROUP BY u.id, u.name
    HAVING COUNT(t.*) FILTER (WHERE t.completed) < COUNT(t.*)
  `);
  for (const user of rows) {
    await sendToUser(user.id, {
      title: `Hey ${user.name.split(' ')[0]}, your tasks are still waiting 👀`,
      body: `${user.done}/${user.total} done today. Instagram can wait a little longer.`,
    });
  }
}, { timezone: 'Asia/Kolkata' });

// 10:00 PM — last call, only for users with an active streak at risk.
cron.schedule('0 22 * * *', async () => {
  const { rows } = await pool.query(`
    SELECT u.id, u.name,
           COUNT(t.*) AS total,
           COUNT(t.*) FILTER (WHERE t.completed) AS done
    FROM users u
    JOIN tasks t ON t.user_id = u.id AND t.task_date = CURRENT_DATE
    GROUP BY u.id, u.name
    HAVING COUNT(t.*) FILTER (WHERE t.completed) < COUNT(t.*)
  `);
  for (const user of rows) {
    const remaining = user.total - user.done;
    await sendToUser(user.id, {
      title: `⏳ Don't break the streak, ${user.name.split(' ')[0]}`,
      body: `${remaining} task${remaining === 1 ? '' : 's'} left before midnight. So close.`,
    });
  }
}, { timezone: 'Asia/Kolkata' });

console.log('Notification cron jobs scheduled (8 AM, 6 PM, 10 PM IST)');
