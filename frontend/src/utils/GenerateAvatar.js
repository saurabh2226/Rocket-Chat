// Updated DiceBear API v9.x endpoints
const generateDiceBearAvataaars = (seed) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

const generateDiceBearBottts = (seed) =>
  `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`;

const generateDiceBearPixelArt = (seed) =>
  `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

const generateDiceBearAdventurer = (seed) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

export const generateAvatar = () => {
  const data = [];

  // Generate 2 Avataaars style avatars
  for (let i = 0; i < 2; i++) {
    const res = generateDiceBearAvataaars(Math.random());
    data.push(res);
  }
  
  // Generate 2 Bottts style avatars
  for (let i = 0; i < 2; i++) {
    const res = generateDiceBearBottts(Math.random());
    data.push(res);
  }
  
  // Generate 1 Pixel Art style avatar
  for (let i = 0; i < 1; i++) {
    const res = generateDiceBearPixelArt(Math.random());
    data.push(res);
  }
  
  // Generate 1 Adventurer style avatar
  for (let i = 0; i < 1; i++) {
    const res = generateDiceBearAdventurer(Math.random());
    data.push(res);
  }
  
  return data;
};
