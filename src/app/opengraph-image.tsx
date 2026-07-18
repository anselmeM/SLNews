import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SLNews - Sierra Leone News";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div tw="flex flex-col items-center justify-center w-full h-full bg-[#006e1c] text-white p-16">
        <div tw="text-8xl font-black tracking-tighter mb-6">SL News</div>
        <div tw="text-3xl font-medium text-green-100 max-w-3xl text-center">
          Community journalism and global news aggregation for Sierra Leone
        </div>
      </div>
    ),
    { ...size }
  );
}