export const getOrderType = (record) => {
  if (!record) return "-"; // ✅ Prevents errors if record is undefined

  if (record.pickupOrder) return "PICKUP";
  if (record.onlineOrder) return "ONLINE ORDER";

  return "DINE-IN"; // Default if neither pickup nor online order
};