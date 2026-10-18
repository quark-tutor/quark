// Remove a connection string, and its password, from text before it is printed.
export function scrubUrl(text: string, url: string): string {
  let out = text.split(url).join("[database url]");
  try {
    const u = new URL(url);
    for (const secret of [u.password, decodeURIComponent(u.password), encodeURIComponent(decodeURIComponent(u.password))]) {
      if (secret) out = out.split(secret).join("[password]");
    }
  } catch {
    // not a parseable URL: the whole-string replacement above is all there is
  }
  // Any other postgres URL with a password in it.
  return out.replace(/(postgres(?:ql)?:\/\/[^:\s/@]+:)[^@\s]+@/g, "$1[password]@");
}
