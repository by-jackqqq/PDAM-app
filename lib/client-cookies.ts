// lib/client-cookies.ts
// Cookie harus disimpan TANPA httpOnly agar middleware server bisa membaca
// dan tanpa prefix khusus agar js-cookie & Next.js request.cookies sama-sama bisa akses

import Cookies from "js-cookie";

/**
 * Simpan cookie yang bisa dibaca oleh middleware Next.js (server-side).
 * PENTING: tidak pakai httpOnly karena kita set dari client,
 * tapi middleware tetap bisa baca via request.cookies.
 */
export function storeCookie(key: string, value: string, days = 1) {
  Cookies.set(key, value, {
    expires: days,
    path: "/",
    sameSite: "lax",
    // secure: true  // aktifkan jika sudah pakai HTTPS
  });
}

export function getCookie(key: string): string | undefined {
  return Cookies.get(key);
}

export function removeCookie(key: string) {
  Cookies.remove(key, { path: "/" });
}
