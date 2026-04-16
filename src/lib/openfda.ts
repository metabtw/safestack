const BASE_URL = 'https://api.fda.gov/drug';

export async function getDrugInteractions(drugName: string) {
  try {
    const url = `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drugName)}"&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.drug_interactions?.[0] || null;
  } catch (e) {
    return null;
  }
}

export async function getDrugWarnings(drugName: string) {
  try {
    const url = `${BASE_URL}/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      warnings: data?.results?.[0]?.warnings?.[0] || null,
      boxed_warnings: data?.results?.[0]?.boxed_warning?.[0] || null
    };
  } catch (e) {
    return null;
  }
}
