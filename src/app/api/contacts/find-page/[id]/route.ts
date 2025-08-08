import { NextRequest } from 'next/server';
import { snowflakeManagerVercel as snowflakeManager } from '@/lib/snowflake-vercel';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contactId = params.id;
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
    const result = await snowflakeManager.execute(query, [contactId]);
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