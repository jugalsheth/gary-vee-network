import { NextRequest } from 'next/server';

// Conditional import based on environment
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const { snowflakeManager } = isVercel 
  ? require('@/lib/snowflake-vercel-deploy')
  : require('@/lib/snowflake');

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Query to find the position of this contact in the ordered list
    const query = `
      SELECT COUNT(*) as position 
      FROM gary_vee_contacts 
      WHERE created_at >= (
        SELECT created_at 
        FROM gary_vee_contacts 
        WHERE id = ?
      )
      ORDER BY created_at DESC
    `;
    const result = await snowflakeManager.execute(query, [id]);
    const position = result[0]?.POSITION || 1;
    // Calculate page (30 contacts per page)
    const page = Math.ceil(position / 30);
    return Response.json({ 
      page: page,
      position: position 
    });
  } catch (error) {
    console.error('Error finding contact page:', error);
    return Response.json({ page: 1 }, { status: 500 });
  }
} 