import { NextRequest, NextResponse } from 'next/server';
import { getWarehouseInventory } from '@/lib/warehouse-detail';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = params.id;
    const { searchParams } = new URL(request.url);
    
    const filters = {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      category: searchParams.get('category') || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const inventory = await getWarehouseInventory(warehouseId, filters);
    
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching warehouse inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}


