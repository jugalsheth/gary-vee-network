import { getContacts, getContactsPaginated, addContact, updateContact, deleteContact, searchContactsPaginated } from '@/lib/storage-vercel';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '', 10);
    const limit = parseInt(searchParams.get('limit') || '', 10);
    // Supported filters
    const tier = searchParams.get('tier') || undefined;
    const team = searchParams.get('team') || undefined;
    const location = searchParams.get('location') || undefined;
    const filters = { tier, team, location };
    // If pagination params are present, use paginated fetch with filters
    if (!isNaN(page) && !isNaN(limit)) {
      console.log(`📖 API: Fetching paginated contacts (page=${page}, limit=${limit}, filters=${JSON.stringify(filters)})...`);
      const { contacts, pagination } = await getContactsPaginated(page, limit, filters);
      return new Response(JSON.stringify({ contacts, pagination }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fallback: fetch all contacts (legacy)
      console.log('📖 API: Fetching all contacts (legacy)...');
      const contacts = await getContacts();
      return new Response(JSON.stringify(contacts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API: Get contacts failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 API: Adding contact...');
    const contactData = await request.json();
    const newContact = await addContact(contactData);
    console.log('✅ API: Contact added:', newContact.id);
    return new Response(JSON.stringify(newContact), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API: Add contact failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 API: Updating contact...');
    const { id, ...updates } = await request.json();
    if (!id) {
      throw new Error('Contact ID is required for update');
    }
    const updatedContact = await updateContact(id, updates);
    console.log('✅ API: Contact updated:', id);
    return new Response(JSON.stringify(updatedContact), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API: Update contact failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Deleting contact...');
    const { id } = await request.json();
    if (!id) {
      throw new Error('Contact ID is required for deletion');
    }
    await deleteContact(id);
    console.log('✅ API: Contact deleted:', id);
    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API: Delete contact failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Search endpoint
export async function GET_search(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    
    if (!query) {
      return new Response(JSON.stringify({ contacts: [], pagination: { currentPage: 1, itemsPerPage: limit, totalItems: 0, totalPages: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 API: Searching contacts for "${query}" (page=${page}, limit=${limit})...`);
    const { contacts, pagination } = await searchContactsPaginated(query, page, limit);
    return new Response(JSON.stringify({ contacts, pagination }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API: Search contacts failed:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 