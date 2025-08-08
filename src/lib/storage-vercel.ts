import { snowflakeManagerVercelDeploy as snowflakeManager } from './snowflake-vercel-deploy';
import { Contact } from './types';
import type { Tier } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function getContacts(): Promise<Contact[]> {
  console.log('📖 Fetching contacts from Snowflake...');
  try {
    const rows = await snowflakeManager.execute(`
      SELECT * FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts 
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
    
    const query = 'SELECT * FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts WHERE id = ? LIMIT 1';
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
      SELECT * FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts 
      ${whereSQL}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    // Fetch total count
    const countQuery = `SELECT COUNT(*) as total FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts ${whereSQL}`;
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
    const searchQuery = `
      SELECT * FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts 
      WHERE LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(notes) LIKE LOWER(?)
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const searchTerm = `%${query}%`;
    const rows = await snowflakeManager.execute(searchQuery, [searchTerm, searchTerm, searchTerm, limit, offset]);
    const contacts = (rows as unknown[]).map(mapRowToContact) || [];
    return {
      contacts,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: contacts.length,
        totalPages: Math.ceil(contacts.length / limit)
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to search contacts:', error);
    throw new Error('Database connection failed');
  }
}

// Analytics functions
export async function getContactsAnalytics() {
  try {
    const totalQuery = 'SELECT COUNT(*) as total FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts';
    const tierQuery = `
      SELECT tier, COUNT(*) as count
      FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts
      GROUP BY tier
    `;
    
    const [totalRows, tierRows] = await Promise.all([
      snowflakeManager.execute(totalQuery),
      snowflakeManager.execute(tierQuery)
    ]);
    
    const total = totalRows[0]?.TOTAL || 0;
    const tierCounts = (tierRows as any[]).reduce((acc, row) => {
      acc[row.TIER] = row.COUNT;
      return acc;
    }, {});
    
    return {
      total,
      tierCounts,
      tier1Count: tierCounts.tier1 || 0,
      tier2Count: tierCounts.tier2 || 0,
      tier3Count: tierCounts.tier3 || 0
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch analytics:', error);
    throw new Error('Database connection failed');
  }
}

export async function getContactsAnalyticsWithFilters(filters: { tier?: string; location?: string; team?: string }) {
  try {
    let whereClauses: string[] = [];
    let params: any[] = [];
    
    if (filters?.tier) {
      whereClauses.push('tier = ?');
      params.push(filters.tier);
    }
    if (filters?.location) {
      whereClauses.push('location = ?');
      params.push(filters.location);
    }
    if (filters?.team) {
      whereClauses.push('team = ?');
      params.push(filters.team);
    }
    
    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const totalQuery = `SELECT COUNT(*) as total FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts ${whereSQL}`;
    const tierQuery = `
      SELECT tier, COUNT(*) as count
      FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts
      ${whereSQL}
      GROUP BY tier
    `;
    
    const [totalRows, tierRows] = await Promise.all([
      snowflakeManager.execute(totalQuery, params),
      snowflakeManager.execute(tierQuery, params)
    ]);
    
    const total = totalRows[0]?.TOTAL || 0;
    const tierCounts = (tierRows as any[]).reduce((acc, row) => {
      acc[row.TIER] = row.COUNT;
      return acc;
    }, {});
    
    return {
      total,
      tierCounts,
      tier1Count: tierCounts.tier1 || 0,
      tier2Count: tierCounts.tier2 || 0,
      tier3Count: tierCounts.tier3 || 0
    };
  } catch (error: any) {
    console.error('❌ Failed to fetch filtered analytics:', error);
    throw new Error('Database connection failed');
  }
}

// Network stats
export async function getNetworkStats() {
  try {
    const query = 'SELECT id, name, tier, connections FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts';
    const rows = await snowflakeManager.execute(query);
    return rows;
  } catch (error: any) {
    console.error('❌ Failed to fetch network stats:', error);
    throw new Error('Database connection failed');
  }
}

// Helper function to escape JSON for SQL
function escapeJsonForSql(json: string): string {
  return json.replace(/'/g, "''");
}

// Add contact function
export async function addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
  try {
    console.log('🔄 NUCLEAR FIX: Adding contact with data:', contact);
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Prepare the query with only primitive values
    const query = `
      INSERT INTO VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts (
        id, name, email, phone, location, tier, team, relationship_to_gary, 
        has_kids, is_married, interests, notes, instagram, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
    `;
    
    // Convert complex objects to JSON strings and escape them
    const interestsJson = contact.interests ? JSON.stringify(contact.interests) : null;
    const notesEscaped = contact.notes ? escapeJsonForSql(contact.notes) : null;
    
    const values = [
      id,
      contact.name || '',
      contact.email || '',
      contact.phone || '',
      contact.location || '',
      contact.tier || 'tier3',
      contact.team || '',
      contact.relationshipToGary || '',
      contact.hasKids ? 1 : 0,
      contact.isMarried ? 1 : 0,
      interestsJson,
      notesEscaped,
      contact.instagram || ''
    ];
    
    console.log('🔄 Insert query:', query);
    console.log('🔄 Final values (should be primitives only):', values);
    
    await snowflakeManager.execute(query, values);
    
    // Fetch the newly created contact
    const newContact = await getContactById(id);
    if (!newContact) {
      throw new Error('Failed to retrieve newly created contact');
    }
    
    console.log('✅ NUCLEAR FIX: Contact added successfully');
    return newContact;
  } catch (error: any) {
    console.error('❌ NUCLEAR FIX: Failed to add contact:', error);
    throw error;
  }
}

// Update contact function
export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  try {
    console.log('🔄 NUCLEAR FIX: Updating contact with ID:', id);
    console.log('🔄 Updates received:', updates);
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.location !== undefined) {
      updateFields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.tier !== undefined) {
      updateFields.push('tier = ?');
      values.push(updates.tier);
    }
    if (updates.team !== undefined) {
      updateFields.push('team = ?');
      values.push(updates.team);
    }
    if (updates.relationshipToGary !== undefined) {
      updateFields.push('relationship_to_gary = ?');
      values.push(updates.relationshipToGary);
    }
    if (updates.hasKids !== undefined) {
      updateFields.push('has_kids = ?');
      values.push(updates.hasKids ? 1 : 0);
    }
    if (updates.isMarried !== undefined) {
      updateFields.push('is_married = ?');
      values.push(updates.isMarried ? 1 : 0);
    }
    if (updates.interests !== undefined) {
      updateFields.push('interests = ?');
      values.push(JSON.stringify(updates.interests));
    }
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(escapeJsonForSql(updates.notes));
    }
    if (updates.instagram !== undefined) {
      updateFields.push('instagram = ?');
      values.push(updates.instagram);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP()');
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      UPDATE VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    values.push(id);
    
    console.log('🔄 Update query:', query);
    console.log('🔄 Final values (should be primitives only):', values);
    
    await snowflakeManager.execute(query, values);
    
    // Fetch the updated contact
    const updatedContact = await getContactById(id);
    if (!updatedContact) {
      throw new Error('Failed to retrieve updated contact');
    }
    
    console.log('✅ NUCLEAR FIX: Contact updated successfully');
    return updatedContact;
  } catch (error: any) {
    console.error('❌ NUCLEAR FIX: Failed to update contact:', error);
    throw error;
  }
}

// Delete contact function
export async function deleteContact(id: string): Promise<void> {
  try {
    const query = 'DELETE FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.gary_vee_contacts WHERE id = ?';
    await snowflakeManager.execute(query, [id]);
    console.log('✅ Contact deleted successfully:', id);
  } catch (error: any) {
    console.error('❌ Failed to delete contact:', error);
    throw error;
  }
}

// Connection management functions
export async function addConnection(connection: {
  contactId: string;
  targetContactId: string;
  strength: string;
  type: string;
  notes?: string;
}): Promise<void> {
  try {
    const query = `
      INSERT INTO VXSFINANCE_CORE_DATA.REPORTING_MODEL.contact_connections 
      (contact_id, target_contact_id, strength, type, notes, created_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
    `;
    await snowflakeManager.execute(query, [
      connection.contactId,
      connection.targetContactId,
      connection.strength,
      connection.type,
      connection.notes || ''
    ]);
  } catch (error: any) {
    console.error('❌ Failed to add connection:', error);
    throw error;
  }
}

export async function removeConnection(contactId: string, targetContactId: string): Promise<void> {
  try {
    const query = `
      DELETE FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.contact_connections 
      WHERE contact_id = ? AND target_contact_id = ?
    `;
    await snowflakeManager.execute(query, [contactId, targetContactId]);
  } catch (error: any) {
    console.error('❌ Failed to remove connection:', error);
    throw error;
  }
}

export async function getConnectionsForContact(contactId: string) {
  try {
    const query = `
      SELECT * FROM VXSFINANCE_CORE_DATA.REPORTING_MODEL.contact_connections WHERE contact_id = ?
    `;
    const rows = await snowflakeManager.execute(query, [contactId]);
    return rows;
  } catch (error: any) {
    console.error('❌ Failed to fetch connections:', error);
    throw error;
  }
}

// Helper function to convert snake_case to camelCase
function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Helper function to map database row to Contact object
function mapRowToContact(row: any): Contact {
  return {
    id: row.ID || row.id,
    name: row.NAME || row.name || '',
    email: row.EMAIL || row.email || '',
    phone: row.PHONE || row.phone || '',
    location: row.LOCATION || row.location || '',
    tier: (row.TIER || row.tier || 'tier3') as Tier,
    team: row.TEAM || row.team || '',
    relationshipToGary: row.RELATIONSHIP_TO_GARY || row.relationship_to_gary || '',
    hasKids: Boolean(row.HAS_KIDS || row.has_kids),
    isMarried: Boolean(row.IS_MARRIED || row.is_married),
    interests: row.INTERESTS || row.interests ? JSON.parse(row.INTERESTS || row.interests) : [],
    notes: row.NOTES || row.notes || '',
    instagram: row.INSTAGRAM || row.instagram || '',
    createdAt: row.CREATED_AT || row.created_at || new Date().toISOString(),
    updatedAt: row.UPDATED_AT || row.updated_at || new Date().toISOString(),
    connections: row.CONNECTIONS || row.connections ? JSON.parse(row.CONNECTIONS || row.connections) : []
  };
} 