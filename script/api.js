// base url
const BASE_URL = "http://localhost:3000";

// get units by type
export async function getUnits(type) {
  try {
    const res = await fetch(`${BASE_URL}/units?type=${type}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("API Error (getUnits):", error);
    return [];
  }
}