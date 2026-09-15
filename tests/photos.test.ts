import { it, expect, vi } from "vitest";
import { photoProcessor } from "../src/services/photos";
it("HEICを対応形式への日本語案内で拒否する", async () => {
  await expect(
    photoProcessor.prepare(
      new File(["data"], "photo.heic", { type: "image/heic" }),
    ),
  ).rejects.toThrow("JPEG");
});
it("20MBを超える写真はデコード前に拒否する", async () => {
  const file = new File([new Uint8Array(20 * 1024 * 1024 + 1)], "large.jpg", {
    type: "image/jpeg",
  });
  await expect(photoProcessor.prepare(file)).rejects.toThrow("20MB");
});
it("壊れた画像を読み込めない場合に入力保持の案内を返す", async () => {
  vi.stubGlobal("createImageBitmap", () => Promise.reject(Error("decode")));
  await expect(
    photoProcessor.prepare(
      new File(["broken"], "bad.png", { type: "image/png" }),
    ),
  ).rejects.toThrow("入力内容は保持");
  vi.unstubAllGlobals();
});
