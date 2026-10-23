// The dev server for a real iPad on the home Wi-Fi, over HTTPS, because Safari gives the microphone only to a
// secure page (docs/tutor-voice-slice.md, stop 1). It runs on test like `npm run dev`; nothing here reaches live.
//   npm run dev:ipad
//
// 1. Finds the laptop's address on the home network (or takes DEV_ORIGIN).
// 2. Makes a certificate for that address, once: a one-time authority signs it and its private key is deleted at
//    once, so it can never sign anything else (Brandon, 22 Oct 2026: "Yes to the certificate"). Kept in
//    certificates/, which git ignores. A new address makes a new pair, and the iPad installs the new one.
// 3. Serves the authority's certificate, and nothing else, at http://<address>:3001 for Safari on the iPad to
//    install once: Settings, Profile Downloaded, Install; then General, About, Certificate Trust Settings, on.
// 4. Starts `next dev` at https://<address>:3000, with DEV_ORIGIN set for that address.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces, tmpdir } from "node:os";
import { join } from "node:path";
import { X509Certificate } from "node:crypto";

const DIR = "certificates";
const CA = join(DIR, "quark-dev-ca.crt");
const KEY = join(DIR, "ipad-key.pem");
const CERT = join(DIR, "ipad.pem");
const CERT_PORT = 3001;

// A private IPv4 address on a real network card, not a virtual one (WSL, Hyper-V, VirtualBox, VMware).
function homeAddress(): string {
  if (process.env.DEV_ORIGIN) return process.env.DEV_ORIGIN;
  const found: { name: string; address: string }[] = [];
  for (const [name, list] of Object.entries(networkInterfaces())) {
    for (const a of list ?? []) {
      if (a.family !== "IPv4" || a.internal) continue;
      if (!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address)) continue;
      if (/vEthernet|WSL|VirtualBox|VMware|Hyper-V|Loopback/i.test(name)) continue;
      found.push({ name, address: a.address });
    }
  }
  const best = found.find((f) => /Wi-?Fi|Wireless|WLAN/i.test(f.name)) ?? found[0];
  if (!best) throw new Error("No home-network address found. Set DEV_ORIGIN to the laptop's address (ipconfig shows it).");
  return best.address;
}

// openssl from the PATH, or the copy Git for Windows carries.
function openssl(): string {
  const candidates = ["openssl", "C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe", "C:\\Program Files\\Git\\usr\\bin\\openssl.exe"];
  const found = candidates.find((c) => spawnSync(c, ["version"], { stdio: "ignore" }).status === 0);
  if (!found) throw new Error("openssl was not found; Git for Windows carries one.");
  return found;
}

function run(bin: string, args: string[]) {
  const r = spawnSync(bin, args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`openssl ${args[0]} failed: ${r.stderr}`);
}

const covers = (address: string) => existsSync(CA) && existsSync(KEY) && existsSync(CERT) && new X509Certificate(readFileSync(CERT)).checkIP(address) !== undefined;

function makeCertificate(address: string) {
  const bin = openssl();
  mkdirSync(DIR, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "quark-ca-"));
  const caKey = join(work, "ca.key");
  try {
    run(bin, ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "825", "-keyout", caKey, "-out", CA,
      "-subj", `/CN=Quark dev, this laptop at ${address} only`, "-addext", "basicConstraints=critical,CA:TRUE", "-addext", "keyUsage=critical,keyCertSign,cRLSign"]);
    const csr = join(work, "ipad.csr");
    run(bin, ["req", "-newkey", "rsa:2048", "-nodes", "-sha256", "-keyout", KEY, "-out", csr, "-subj", `/CN=${address}`]);
    const ext = join(work, "ext.cnf");
    writeFileSync(ext, `subjectAltName=IP:${address},IP:127.0.0.1,DNS:localhost\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n`);
    run(bin, ["x509", "-req", "-in", csr, "-CA", CA, "-CAkey", caKey, "-set_serial", `0x${Date.now().toString(16)}`, "-sha256", "-days", "397", "-out", CERT, "-extfile", ext]);
  } finally {
    // The authority's private key is gone once it has signed: nothing else can ever be signed with it.
    rmSync(work, { recursive: true, force: true });
  }
}

const address = homeAddress();
if (!covers(address)) {
  makeCertificate(address);
  console.log(`A new certificate for ${address}. The iPad installs it once (below); an older one can be removed in Settings.`);
}

createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/x-x509-ca-cert", "Content-Disposition": 'attachment; filename="quark-dev.crt"' });
  res.end(readFileSync(CA));
}).listen(CERT_PORT, "0.0.0.0");

console.log(`\nOn the iPad, in Safari:\n  once: http://${address}:${CERT_PORT}  (install it, then turn it on under General, About, Certificate Trust Settings)\n  then: https://${address}:3000/kid\n`);

const next = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "--hostname", "0.0.0.0", "--experimental-https", "--experimental-https-key", KEY, "--experimental-https-cert", CERT], {
  stdio: "inherit",
  env: { ...process.env, DEV_ORIGIN: address },
  shell: process.platform === "win32",
});
next.on("exit", (code) => process.exit(code ?? 0));
