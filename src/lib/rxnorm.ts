const BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

async function fetchWithRetry(url: string, retries = 3, backoff = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
}

export async function searchByName(name: string) {
  const url = `${BASE_URL}/drugs.json?name=${encodeURIComponent(name)}`;
  return fetchWithRetry(url);
}

export async function getRxCUI(drugName: string) {
  const url = `${BASE_URL}/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
  const data = await fetchWithRetry(url);
  return data?.idGroup?.rxnormId?.[0] || null;
}

export async function getInteractions(rxcuiList: string[]) {
  if (rxcuiList.length < 2) return null;
  const url = `${BASE_URL}/interaction/list.json?rxcuis=${rxcuiList.join('+')}`;
  return fetchWithRetry(url);
}
