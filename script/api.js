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

// get conversions
export async function getConversion(from, to) {
  try {
    const res = await fetch(
      `${BASE_URL}/conversions?from=${from}&to=${to}` //http://localhost:3000/conversion?from=''&to=''
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json(); //  array

    if (!data.length) {
      throw new Error("No conversion found");
    }

    return data[0]; 

  } catch (error) {
    console.error("API Error (getConversion):", error);
    throw error; 
  }
}