import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Stub endpoint - returns empty overview data
    const data = {
      totalRequests: 0,
      errorRequests: 0,
      errorRate: 0,
      peakHour: '00',
      ordersCount: 0,
      requestsByHour: [],
      requestsByDay: [],
      errorsBySeverity: [],
      topOperations: [],
      topItems: [],
      topCustomers: [],
      topOrders: [],
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
