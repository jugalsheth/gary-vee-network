import { snowflakeManager } from './snowflake';
import { Contact } from './types';
import type { Tier } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function getContacts(): Promise<Contact[]> {
  console.log('📖 Fetching contacts from Snowflake...');
  try {
    const rows = await snowflakeManager.execute(`
      SELECT * FROM gary_vee_contacts 
      ORDER BY created_at DESC
    `);
    const resultRows = rows as unknown[];
    console.log(`📊 Retrieved ${resultRows?.length || 0} contacts`);
    return resultRows.map(mapRowToContact) || [];
  } catch (error: any) {
    console.error('❌ Failed to fetch contacts:', error);
    throw new Error('Database connection failed');
  }
}

// ADD this new function (keep existing getContacts function)
export async function getContactById(id: string): Promise<Contact | null> {
  try {
    console.log('🔍 Fetching single contact with optimized query:', id);
    
    const query = 'SELECT * FROM gary_vee_contacts WHERE id = ? LIMIT 1';
    const result = await snowflakeManager.execute(query, [id]);
    
    if (result.length === 0) {
      console.log('❌ Contact not found:', id);
      return null;
    }
    
    console.log('✅ Single contact found:', result[0]);
    return mapRowToContact(result[0]);
  } catch (error: any) {
    console.error('❌ Error in getContactById:', error);
    throw error;
  }
}

// Paginated contacts fetcher with filters
export async function getContactsPaginated(
  page: number = 1,
  limit: number = 30,
  filters?: { tier?: string; team?: string; location?: string }
) {
  try {
    const offset = (page - 1) * limit;
    let whereClauses: string[] = [];
    let params: any[] = [];
    if (filters?.tier) {
      whereClauses.push('tier = ?');
      params.push(filters.tier);
    }
    if (filters?.team) {
      whereClauses.push('team = ?');
      params.push(filters.team);
    }
    if (filters?.location) {
      whereClauses.push('location = ?');
      params.push(filters.location);
    }
    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // Fetch paginated contacts
    const dataQuery = `
      SELECT * FROM gary_vee_contacts 
      ${whereSQL}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    // Fetch total count
    const countQuery = `SELECT COUNT(*) as total FROM gary_vee_contacts ${whereSQL}`;
    const [dataRows, countRows] = await Promise.all([
      snowflakeManager.execute(dataQuery, [...params, limit, offset]),
      snowflakeManager.execute(countQuery, params)
    ]);
    const contacts = (dataRows as unknown[]).map(mapRowToContact) || [];
    const totalItems = countRows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      contacts,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch paginated contacts:', error);
    throw new Error('Database connection failed');
  }
}

// Paginated search contacts
export async function searchContactsPaginated(query: string, page: number = 1, limit: number = 30) {
  try {
    const offset = (page - 1) * limit;
    const likeQuery = `%${query}%`;
    // Search contacts with LIKE on name, email, notes
    const dataQuery = `
      SELECT * FROM gary_vee_contacts
      WHERE LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(notes) LIKE LOWER(?)
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT COUNT(*) as total FROM gary_vee_contacts
      WHERE LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(notes) LIKE LOWER(?)
    `;
    const [dataRows, countRows] = await Promise.all([
      snowflakeManager.execute(dataQuery, [likeQuery, likeQuery, likeQuery, limit, offset]),
      snowflakeManager.execute(countQuery, [likeQuery, likeQuery, likeQuery])
    ]);
    const contacts = (dataRows as unknown[]).map(mapRowToContact) || [];
    const totalItems = countRows[0]?.TOTAL || 0;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      contacts,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to search paginated contacts:', error);
    throw new Error('Database connection failed');
  }
}

// Analytics: total contacts and tier breakdown
export async function getContactsAnalytics() {
  try {
    // Total contacts
    const totalQuery = 'SELECT COUNT(*) as total FROM gary_vee_contacts';
    // Tier breakdown
    const tierQuery = `
      SELECT tier, COUNT(*) as count
      FROM gary_vee_contacts
      GROUP BY tier
    `;
    const [totalRows, tierRows] = await Promise.all([
      snowflakeManager.execute(totalQuery),
      snowflakeManager.execute(tierQuery)
    ]);
    const totalContacts = totalRows[0]?.TOTAL || 0;
    const tierCounts: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0 };
    for (const row of tierRows) {
      if (row.TIER && row.COUNT !== undefined) {
        tierCounts[row.TIER.toLowerCase()] = Number(row.COUNT);
      }
    }
    return {
      totalContacts,
      ...tierCounts
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch contacts analytics:', error);
    throw new Error('Database connection failed');
  }
}

export async function getContactsAnalyticsWithFilters(filters: { tier?: string; location?: string; team?: string }) {
  try {
    let whereClauses: string[] = [];
    let params: any[] = [];
    if (filters.tier) {
      whereClauses.push('tier = ?');
      params.push(filters.tier);
    }
    if (filters.location) {
      whereClauses.push('location = ?');
      params.push(filters.location);
    }
    if (filters.team) {
      whereClauses.push('team = ?');
      params.push(filters.team);
    }
    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    // Total contacts (filtered)
    const totalQuery = `SELECT COUNT(*) as total FROM gary_vee_contacts ${whereSQL}`;
    // Tier breakdown (filtered)
    const tierQuery = `
      SELECT tier, COUNT(*) as count
      FROM gary_vee_contacts
      ${whereSQL}
      GROUP BY tier
    `;
    const [totalRows, tierRows] = await Promise.all([
      snowflakeManager.execute(totalQuery, params),
      snowflakeManager.execute(tierQuery, params)
    ]);
    const totalContacts = totalRows[0]?.TOTAL || 0;
    const tierCounts: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0 };
    for (const row of tierRows) {
      if (row.TIER && row.COUNT !== undefined) {
        tierCounts[row.TIER.toLowerCase()] = Number(row.COUNT);
      }
    }
    return {
      totalContacts,
      ...tierCounts
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch filtered contacts analytics:', error);
    throw new Error('Database connection failed');
  }
}

// Advanced network stats
export async function getNetworkStats() {
  try {
    // Fetch all contacts and their connections
    const rows = await snowflakeManager.execute(`SELECT id, name, tier, connections FROM gary_vee_contacts`);
    const contacts = rows.map((row: any) => ({
      id: row.ID,
      name: row.NAME,
      tier: row.TIER,
      connections: Array.isArray(row.CONNECTIONS) ? row.CONNECTIONS : []
    }));
    const totalContacts = contacts.length;
    let totalConnections = 0;
    const connectionCounts: Record<string, number> = {};
    contacts.forEach((c: any) => {
      const count = c.connections.length;
      totalConnections += count;
      connectionCounts[c.id] = count;
    });
    // Each connection is counted twice (A->B, B->A), so divide by 2 if bidirectional
    const uniqueConnections = totalConnections / 2;
    const averageConnections = totalContacts > 0 ? totalConnections / totalContacts : 0;
    // Network density: actual connections / possible connections
    const possibleConnections = totalContacts * (totalContacts - 1) / 2;
    const networkDensity = possibleConnections > 0 ? uniqueConnections / possibleConnections : 0;
    // Hubs: top 5 contacts by connections
    const hubs = contacts
      .map((c: any) => ({ ...c, connectionCount: connectionCounts[c.id] }))
      .sort((a: any, b: any) => b.connectionCount - a.connectionCount)
      .slice(0, 5);
    // Isolated contacts: no connections
    const isolatedContacts = contacts.filter((c: any) => connectionCounts[c.id] === 0);
    return {
      totalContacts,
      totalConnections: uniqueConnections,
      averageConnections,
      networkDensity,
      hubs,
      isolatedContacts
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch network stats:', error);
    throw new Error('Database connection failed');
  }
}

// Helper to escape single quotes for SQL
function escapeJsonForSql(json: string): string {
  return json.replace(/'/g, "''");
}

export async function addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
  console.log('💾 Storage: Adding contact to Snowflake...', contact.name);
  const id = Date.now().toString();
  const now = new Date();
  const newContact = { ...contact, id, createdAt: now, updatedAt: now };
  try {
    // CLEAN INSERT - ONLY fields that exist in database
    await snowflakeManager.execute(`
      INSERT INTO gary_vee_contacts (
        id, name, contact_type, tier, email, phone, city, state, country, 
        location, instagram, instagram_link, follower_count, biography,
        relationship_to_gary, has_kids, is_married, notes, created_by, team
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newContact.id,
      newContact.name,
      newContact.contactType || 'business',
      newContact.tier,
      newContact.email || null,
      newContact.phone || null,
      newContact.city || null,
      newContact.state || null,
      newContact.country || null,
      newContact.location || null,
      newContact.instagram || null,
      newContact.instagramLink || null,
      newContact.followerCount || null,
      newContact.biography || null,
      newContact.relationshipToGary || null,
      newContact.hasKids || false,
      newContact.isMarried || false,
      newContact.notes || null,
      'system',
      newContact.team || 'TeamG'
    ]);
    console.log('✅ Storage: Contact saved to Snowflake successfully');
    return newContact as Contact;
  } catch (error: any) {
    console.error('❌ Storage: Failed to save contact:', error);
    throw new Error('Failed to save contact to database');
  }
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  console.log('🔄 NUCLEAR FIX: Updating contact with ID:', id);
  console.log('🔄 Updates received:', updates);
  // FORCE: Only use the string ID, never pass objects
  const contactId: string = typeof id === 'string' ? id : String(id);
  try {
    // If no updates, just return existing contact
    if (!updates || Object.keys(updates).length === 0) {
      console.log('⚠️ No updates provided, fetching existing contact');
      const selectQuery = 'SELECT * FROM gary_vee_contacts WHERE id = ?';
      // CRITICAL: Pass only the string ID
      const rows = await snowflakeManager.execute(selectQuery, [contactId]);
      if (!rows || rows.length === 0) {
        throw new Error(`Contact with id ${contactId} not found`);
      }
      return mapRowToContact(rows[0]);
    }
    // Build update query with only safe fields
    const updateFields: string[] = [];
    const values: any[] = [];
    // Only update simple string/boolean/number fields
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.tier !== undefined) {
      updateFields.push('tier = ?');
      values.push(updates.tier);
    }
    if (updateFields.length === 0) {
      console.log('⚠️ No valid fields to update');
      const selectQuery = 'SELECT * FROM gary_vee_contacts WHERE id = ?';
      // CRITICAL: Pass only the string ID
      const rows = await snowflakeManager.execute(selectQuery, [contactId]);
      return mapRowToContact(rows[0]);
    }
    // Execute update with primitive values only
    const updateQuery = `
      UPDATE gary_vee_contacts 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP() 
      WHERE id = ?
    `;
    // CRITICAL: Add the ID string to the end of values array
    const finalValues = [...values, contactId];
    console.log('🔄 Update query:', updateQuery);
    console.log('🔄 Final values (should be primitives only):', finalValues);
    await snowflakeManager.execute(updateQuery, finalValues);
    // Fetch updated contact - CRITICAL: Pass only string ID
    const selectQuery = 'SELECT * FROM gary_vee_contacts WHERE id = ?';
    const rows = await snowflakeManager.execute(selectQuery, [contactId]);
    if (!rows || rows.length === 0) {
      throw new Error(`Contact with id ${contactId} not found after update`);
    }
    console.log('✅ NUCLEAR FIX: Contact updated successfully');
    return mapRowToContact(rows[0]);
  } catch (error: any) {
    console.error('❌ NUCLEAR FIX: Update failed:', error);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
}

export async function deleteContact(id: string): Promise<void> {
  console.log('🗑️ NUCLEAR FIX: Deleting contact with ID:', id);
  // FORCE: Only use the string ID
  const contactId: string = typeof id === 'string' ? id : String(id);
  try {
    const deleteQuery = 'DELETE FROM gary_vee_contacts WHERE id = ?';
    // CRITICAL: Pass only the string ID
    await snowflakeManager.execute(deleteQuery, [contactId]);
    console.log('✅ NUCLEAR FIX: Contact deleted successfully');
  } catch (error: any) {
    console.error('❌ NUCLEAR FIX: Delete failed:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

// Add a new connection
export async function addConnection(connection: {
  contactId: string;
  targetContactId: string;
  strength: string;
  type: string;
  notes?: string;
}): Promise<void> {
  const id = uuidv4();
  const query = `
    INSERT INTO contact_connections (id, contact_id, target_contact_id, strength, type, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  await snowflakeManager.execute(query, [id, connection.contactId, connection.targetContactId, connection.strength, connection.type, connection.notes || null]);
}

// Remove a connection
export async function removeConnection(contactId: string, targetContactId: string): Promise<void> {
  const query = `
    DELETE FROM contact_connections WHERE contact_id = ? AND target_contact_id = ?
  `;
  await snowflakeManager.execute(query, [contactId, targetContactId]);
}

// Get all connections for a contact
export async function getConnectionsForContact(contactId: string) {
  const query = `
    SELECT * FROM contact_connections WHERE contact_id = ?
  `;
  const rows = await snowflakeManager.execute(query, [contactId]);
  return rows || [];
}

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapRowToContact(row: any): Contact {
  return {
    id: row.ID,
    name: row.NAME,
    contactType: row.CONTACT_TYPE || 'business',
    tier: row.TIER,
    email: row.EMAIL,
    phone: row.PHONE,
    city: row.CITY,
    state: row.STATE,
    country: row.COUNTRY,
    location: row.LOCATION,
    instagram: row.INSTAGRAM,
    instagramLink: row.INSTAGRAM_LINK,
    followerCount: row.FOLLOWER_COUNT,
    biography: row.BIOGRAPHY,
    relationshipToGary: row.RELATIONSHIP_TO_GARY,
    hasKids: Boolean(row.HAS_KIDS),
    isMarried: Boolean(row.IS_MARRIED),
    notes: row.NOTES || '',
    interests: [], // Not stored in DB
    connections: [], // Not stored in DB
    voiceNotes: [], // Not stored in DB
    createdAt: new Date(row.CREATED_AT),
    updatedAt: new Date(row.UPDATED_AT),
    createdBy: row.CREATED_BY,
    team: row.TEAM || 'TeamG'
  };
} 