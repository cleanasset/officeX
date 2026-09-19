import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      badgeNumber,
      photoDataUri,
      accessGate = "Turnstile Gate G-01",
      bypassWatchlist = false
    } = body;

    const checkinTime = new Date().toISOString();
    const assignedBadge = badgeNumber || `BDG-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      visitId: id,
      status: "checked_in",
      checkinAt: checkinTime,
      badge: {
        badgeNumber: assignedBadge,
        type: "PHYSICAL_STICKER",
        accessPoint: accessGate,
        issuedAt: checkinTime
      },
      speedGateRelay: {
        vendor: "GUNNEBO_OPTICAL_RELAY",
        gate: accessGate,
        command: "PULSE_OPEN",
        transitSecondsWindow: 18,
        result: "GRANTED"
      },
      message: `Visitor successfully checked in. Badge ${assignedBadge} issued. Optical speed gate opened.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
