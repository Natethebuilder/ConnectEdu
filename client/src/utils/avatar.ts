

/**
 * Generate a DiceBear avatar URL.
 *
 * @param seed - The unique seed for the avatar (usually user.avatarSeed or user.id)
 * @param style - The avatar style (default: "avataaars")
 *                Other popular styles: "bottts", "identicon", "pixel-art"
 * @returns Full DiceBear URL for the avatar
 */
export const getDicebearUrl = (seed: string, style: string = "avataaars"): string => {
  if (!seed) seed = "default";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
