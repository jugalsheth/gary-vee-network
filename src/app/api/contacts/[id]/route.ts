import { getContacts, updateContact, deleteContact, getContactById, addConnection, removeConnection, getConnectionsForContact } from '@/lib/storage';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Old code (backup):
    // const contacts = await getContacts();
    // const contact = contacts.find(c => c.id === params.id);
    // if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });
    // return Response.json(contact);

    // New optimized code:
    const contact = await getContactById(params.id);
    if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });
    return Response.json(contact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updatedContact = await updateContact(params.id, data);
    return Response.json(updatedContact);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

// --- CONNECTIONS MANAGEMENT ---
// POST /api/contacts/[id]/connections: Add a connection
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    // data: { targetContactId, strength, type, notes }
    await addConnection({
      contactId: params.id,
      targetContactId: data.targetContactId,
      strength: data.strength,
      type: data.type,
      notes: data.notes,
    });
    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]/connections: Remove a connection
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    // data: { targetContactId }
    await removeConnection(params.id, data.targetContactId);
    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

// GET /api/contacts/[id]/connections: List all connections for a contact
export async function GET_connections(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connections = await getConnectionsForContact(params.id);
    return Response.json({ connections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE_contact(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteContact(params.id);
    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
} 