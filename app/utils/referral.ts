export function generateReferralCode(name: string, userId?: string): string {
  const prefix = (name || "NXR")
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X");
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  const num  = Math.floor(10 + Math.random() * 89);
  return `${prefix}${rand}${num}`;
}

export function getUserReferralCode(): string {
  try {
    const userRaw = localStorage.getItem("nexora_user") ||
                    localStorage.getItem("finova_user");
    if (!userRaw) return "";
    const user = JSON.parse(userRaw);
    if (user.referral_code) return user.referral_code;
    const code = generateReferralCode(user.name || "NXR", user.id);
    user.referral_code = code;
    localStorage.setItem("nexora_user", JSON.stringify(user));
    localStorage.setItem("finova_user", JSON.stringify(user));
    return code;
  } catch {
    return "";
  }
}
