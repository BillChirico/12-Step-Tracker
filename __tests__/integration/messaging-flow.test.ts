/**
 * Integration Test: Messaging Flow
 *
 * Tests the complete messaging flow between sponsors and sponsees:
 * 1. Send message
 * 2. Receive message
 * 3. Message history
 * 4. Read/unread status
 *
 * Note: Uses mock database directly due to MSW ESM compatibility issues
 */

import { db, seedDb, resetDb } from '@/mocks/db';
import {
  createSponsor,
  createSponsee,
  createMessage,
  createUnreadMessage,
  createReadMessage,
  createConversation,
  createActiveRelationship,
} from '@/__tests__/fixtures';
import type { Message } from '@/types/database';

describe('Integration: Messaging Flow', () => {
  afterEach(() => {
    resetDb();
  });

  describe('Complete Messaging Workflow', () => {
    it('should handle complete message sending and receiving flow', () => {
      // Arrange: Create sponsor-sponsee relationship
      const sponsor = createSponsor({ id: 'sponsor-msg-1' });
      const sponsee = createSponsee({ id: 'sponsee-msg-1' });
      const relationship = createActiveRelationship({
        id: 'rel-msg-1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        relationships: new Map([[relationship.id, relationship]]),
      });

      // Act: Step 1 - Sponsor sends message to sponsee
      const message = createUnreadMessage({
        id: 'msg-1',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'How are you doing with Step 1?',
      });

      db.messages.set(message.id, message);

      // Assert: Message created successfully
      expect(db.messages.has(message.id)).toBe(true);
      const storedMessage = db.messages.get(message.id);
      expect(storedMessage?.content).toBe('How are you doing with Step 1?');
      expect(storedMessage?.sender_id).toBe(sponsor.id);
      expect(storedMessage?.recipient_id).toBe(sponsee.id);
      expect(storedMessage?.read_at).toBeUndefined(); // Unread

      // Act: Step 2 - Sponsee views their messages
      const sponseeMessages = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id
      );

      // Assert: Sponsee can see the message
      expect(sponseeMessages).toHaveLength(1);
      expect(sponseeMessages[0].id).toBe(message.id);
      expect(sponseeMessages[0].content).toBe('How are you doing with Step 1?');

      // Act: Step 3 - Sponsee reads the message
      if (storedMessage) {
        storedMessage.read_at = new Date().toISOString();
        db.messages.set(message.id, storedMessage);
      }

      // Assert: Message marked as read
      const readMessage = db.messages.get(message.id);
      expect(readMessage?.read_at).toBeDefined();

      // Act: Step 4 - Sponsee replies
      const reply = createUnreadMessage({
        id: 'msg-reply-1',
        sender_id: sponsee.id,
        recipient_id: sponsor.id,
        content: "I'm working through it. It's challenging but eye-opening.",
      });

      db.messages.set(reply.id, reply);

      // Assert: Reply created
      expect(db.messages.has(reply.id)).toBe(true);

      // Act: Step 5 - Sponsor views conversation
      const conversation = Array.from(db.messages.values())
        .filter(
          m =>
            (m.sender_id === sponsor.id && m.recipient_id === sponsee.id) ||
            (m.sender_id === sponsee.id && m.recipient_id === sponsor.id)
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Assert: Full conversation retrieved
      expect(conversation).toHaveLength(2);
      expect(conversation[0].id).toBe(message.id); // Original message
      expect(conversation[1].id).toBe(reply.id); // Reply
    });

    it('should track unread message counts', () => {
      // Arrange: Create users
      const sponsor = createSponsor({ id: 'sponsor-unread' });
      const sponsee = createSponsee({ id: 'sponsee-unread' });

      const msg1 = createUnreadMessage({
        id: 'unread-1',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 1',
      });

      const msg2 = createUnreadMessage({
        id: 'unread-2',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 2',
      });

      const msg3 = createReadMessage({
        id: 'read-1',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 3',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        messages: new Map([
          [msg1.id, msg1],
          [msg2.id, msg2],
          [msg3.id, msg3],
        ]),
      });

      // Act: Count unread messages for sponsee
      const unreadMessages = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id && !m.read_at
      );

      // Assert: Correct unread count
      expect(unreadMessages).toHaveLength(2);

      // Act: Count all messages
      const allMessages = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id
      );

      // Assert: Total message count
      expect(allMessages).toHaveLength(3);
    });

    it('should maintain conversation history chronologically', () => {
      // Arrange: Create conversation
      const sponsor = createSponsor({ id: 'sponsor-history' });
      const sponsee = createSponsee({ id: 'sponsee-history' });

      const conversation = createConversation(sponsor.id, sponsee.id, 5);

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        messages: new Map(conversation.map(m => [m.id, m])),
      });

      // Act: Retrieve conversation in chronological order
      const messages = Array.from(db.messages.values())
        .filter(
          m =>
            (m.sender_id === sponsor.id && m.recipient_id === sponsee.id) ||
            (m.sender_id === sponsee.id && m.recipient_id === sponsor.id)
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Assert: Messages in order
      expect(messages).toHaveLength(5);

      // Verify chronological order
      for (let i = 1; i < messages.length; i++) {
        const prevTime = new Date(messages[i - 1].created_at).getTime();
        const currTime = new Date(messages[i].created_at).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it('should isolate conversations between different users', () => {
      // Arrange: Create multiple users and conversations
      const sponsor = createSponsor({ id: 'sponsor-privacy' });
      const sponsee1 = createSponsee({ id: 'sponsee-privacy-1' });
      const sponsee2 = createSponsee({ id: 'sponsee-privacy-2' });

      const conv1Msg1 = createMessage({
        id: 'conv1-msg1',
        sender_id: sponsor.id,
        recipient_id: sponsee1.id,
        content: 'Message to Sponsee 1',
      });

      const conv1Msg2 = createMessage({
        id: 'conv1-msg2',
        sender_id: sponsee1.id,
        recipient_id: sponsor.id,
        content: 'Reply from Sponsee 1',
      });

      const conv2Msg1 = createMessage({
        id: 'conv2-msg1',
        sender_id: sponsor.id,
        recipient_id: sponsee2.id,
        content: 'Message to Sponsee 2',
      });

      const conv2Msg2 = createMessage({
        id: 'conv2-msg2',
        sender_id: sponsee2.id,
        recipient_id: sponsor.id,
        content: 'Reply from Sponsee 2',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee1.id, sponsee1],
          [sponsee2.id, sponsee2],
        ]),
        messages: new Map([
          [conv1Msg1.id, conv1Msg1],
          [conv1Msg2.id, conv1Msg2],
          [conv2Msg1.id, conv2Msg1],
          [conv2Msg2.id, conv2Msg2],
        ]),
      });

      // Act: Get conversation between sponsor and sponsee1
      const conversation1 = Array.from(db.messages.values()).filter(
        m =>
          (m.sender_id === sponsor.id && m.recipient_id === sponsee1.id) ||
          (m.sender_id === sponsee1.id && m.recipient_id === sponsor.id)
      );

      // Assert: Only messages from this conversation
      expect(conversation1).toHaveLength(2);
      expect(
        conversation1.every(
          m =>
            [sponsor.id, sponsee1.id].includes(m.sender_id) &&
            [sponsor.id, sponsee1.id].includes(m.recipient_id)
        )
      ).toBe(true);

      // Act: Get conversation between sponsor and sponsee2
      const conversation2 = Array.from(db.messages.values()).filter(
        m =>
          (m.sender_id === sponsor.id && m.recipient_id === sponsee2.id) ||
          (m.sender_id === sponsee2.id && m.recipient_id === sponsor.id)
      );

      // Assert: Only messages from this conversation
      expect(conversation2).toHaveLength(2);
      expect(
        conversation2.every(
          m =>
            [sponsor.id, sponsee2.id].includes(m.sender_id) &&
            [sponsor.id, sponsee2.id].includes(m.recipient_id)
        )
      ).toBe(true);
    });

    it('should handle message deletion', () => {
      // Arrange: Create message
      const sponsor = createSponsor({ id: 'sponsor-delete-msg' });
      const sponsee = createSponsee({ id: 'sponsee-delete-msg' });

      const message = createMessage({
        id: 'msg-to-delete',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'This message will be deleted',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        messages: new Map([[message.id, message]]),
      });

      // Assert: Message exists
      expect(db.messages.has(message.id)).toBe(true);

      // Act: Delete the message
      db.messages.delete(message.id);

      // Assert: Message no longer exists
      expect(db.messages.has(message.id)).toBe(false);

      // Act: Query for the deleted message
      const messages = Array.from(db.messages.values()).filter(m => m.id === message.id);

      // Assert: No messages found
      expect(messages).toHaveLength(0);
    });

    it('should support batch reading of messages', () => {
      // Arrange: Create multiple unread messages
      const sponsor = createSponsor({ id: 'sponsor-batch' });
      const sponsee = createSponsee({ id: 'sponsee-batch' });

      const msg1 = createUnreadMessage({
        id: 'batch-1',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 1',
      });

      const msg2 = createUnreadMessage({
        id: 'batch-2',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 2',
      });

      const msg3 = createUnreadMessage({
        id: 'batch-3',
        sender_id: sponsor.id,
        recipient_id: sponsee.id,
        content: 'Message 3',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        messages: new Map([
          [msg1.id, msg1],
          [msg2.id, msg2],
          [msg3.id, msg3],
        ]),
      });

      // Assert: All messages unread initially
      const unreadBefore = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id && !m.read_at
      );
      expect(unreadBefore).toHaveLength(3);

      // Act: Mark all as read
      const readTime = new Date().toISOString();
      Array.from(db.messages.values())
        .filter(m => m.recipient_id === sponsee.id && !m.read_at)
        .forEach(m => {
          m.read_at = readTime;
          db.messages.set(m.id, m);
        });

      // Assert: All messages now read
      const unreadAfter = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id && !m.read_at
      );
      expect(unreadAfter).toHaveLength(0);

      const readAfter = Array.from(db.messages.values()).filter(
        m => m.recipient_id === sponsee.id && m.read_at
      );
      expect(readAfter).toHaveLength(3);
    });
  });
});
