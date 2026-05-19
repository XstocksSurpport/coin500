import { NextResponse } from "next/server";

/** @deprecated Use POST /api/auth/send-code + POST /api/auth/verify */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "\u8bf7\u4f7f\u7528\u90ae\u7bb1\u9a8c\u8bc1\u7801\u767b\u5f55\uff1a\u5148\u83b7\u53d6\u9a8c\u8bc1\u7801\u518d\u9a8c\u8bc1",
    },
    { status: 410 },
  );
}
