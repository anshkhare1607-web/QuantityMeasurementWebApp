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

// saving history
export async function saveHistory(record) {
  try {
    console.log("POSTING TO SERVER...");

    const res = await fetch("http://localhost:3000/history", {
      method: "POST",  // ✅ VERY IMPORTANT
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(record)
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("SAVE ERROR:", error);
    return null;
  }
}

// get history
export async function getHistory() {
  try {
    const res = await fetch(`${BASE_URL}/history?_sort=timestamp&_order=desc`); // http://localhost:3000/history?_sort=timestamp&_order=desc

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json(); 

  } catch (error) {
    console.error("API Error (getHistory):", error);
    return []; 
  }
}