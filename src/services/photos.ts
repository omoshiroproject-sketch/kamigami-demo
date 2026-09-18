import { config } from "../data/seed";
import type { Media } from "../types";
export type PreparedPhoto = {
  media: Media;
  hash: string;
  shrineId?: string;
  sample: boolean;
};
export interface PhotoProcessor {
  prepare(file: File): Promise<PreparedPhoto>;
  sample(index: number): Promise<PreparedPhoto>;
}
async function digest(blob: Blob) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("画像を変換できませんでした。"))),
      "image/jpeg",
      0.84,
    ),
  );
}
export const photoProcessor: PhotoProcessor = {
  async prepare(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw Error(
        "JPEG・PNG・WebPの写真を選んでください。HEICは「互換性優先」で撮影するか、JPEGへ書き出してから追加できます。",
      );
    if (file.size > config.maxImageBytes)
      throw Error(
        "写真は20MB以内にしてください。サイズを小さくして再度お試しください。",
      );
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw Error(
        "写真を読み込めませんでした。別のJPEG・PNG・WebPをお試しください。入力内容は保持しています。",
      );
    }
    try {
      const scale = Math.min(1, 700 / Math.max(bitmap.width, bitmap.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(bitmap.width * scale));
      c.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = c.getContext("2d");
      if (!ctx) throw Error("画像を表示できません。");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(bitmap, 0, 0, c.width, c.height);
      return {
        media: { original: file, thumbnail: await canvasBlob(c) },
        hash: await digest(file),
        sample: false,
      };
    } finally {
      bitmap.close();
    }
  },
  async sample(index) {
    const file = await fetch(`/samples/sample-${index}.svg`).then((r) => {
      if (!r.ok) throw Error("サンプル画像を読み込めませんでした。");
      return r.blob();
    });
    return {
      media: { original: file, thumbnail: file },
      hash: await digest(file),
      sample: true,
      shrineId: ["ise", "ryozenji", "sample-1"][index - 1],
    };
  },
};
