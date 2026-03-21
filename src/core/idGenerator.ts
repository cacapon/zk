// 誤読しにくい文字のみ使用（0,1,i,l,o等を除外）
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

function genRandomString(n: number): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < n; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export function genUniqueID(
  prefix: string,
  len: number,
  existingIDs: string[]
): string {
  while (true) {
    const id = prefix + genRandomString(len);
    if (!existingIDs.includes(id)) return id;
  }
}

// idの先頭minLen文字から始め、既存aliasと重複しない最短のaliasを返す
export function genUniqueAlias(
  id: string,
  minLen: number,
  existingAliases: string[]
): string | null {
  for (let i = minLen; i < id.length; i++) {
    const cand = id.slice(0, i);
    if (!existingAliases.some((a) => a.startsWith(cand))) return cand;
  }
  return null; // 想定外
}
