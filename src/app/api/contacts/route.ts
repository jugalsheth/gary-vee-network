import { getContacts, addContact, updateContact, deleteContact } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    console.log('📖 API: Fetching contacts...');
    const contacts = await getContacts();
    console.log(`✅ API: Retrieved ${contacts.length} contacts`);
    return new Response(JSON.stringify(contacts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
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