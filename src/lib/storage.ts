import { snowflakeManager } from './snowflake';
import { Contact } from './types';
import type { Tier } from './types';

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
  } catch (error) {
    console.error('❌ Failed to fetch contacts:', error);
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('❌ NUCLEAR FIX: Delete failed:', error);
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
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