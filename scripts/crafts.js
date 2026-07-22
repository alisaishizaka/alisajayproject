export async function loadCrafts() {
  const response = await fetch("./data/crafts.json");
  return await response.json();
}
