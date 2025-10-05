# Multi-Chat System Documentation

## Overview

The AI Code Studio now features a complete multi-chat system with conversation isolation and persistence. Each conversation has its own independent set of files stored in Supabase.

## Key Features

### 1. Multiple Conversations
- Create up to 10 separate conversations
- Each conversation is completely isolated with its own files
- Switch between conversations seamlessly
- Real-time updates when conversations are created or deleted

### 2. File Isolation
- Each conversation has its own independent file system
- Files are persisted to Supabase database
- When switching conversations, files automatically load from the database
- Changes to files are auto-saved to the database

### 3. Conversation Management
- **New Chat**: Click the "New Chat" button to start a fresh conversation
- **Select Chat**: Click any conversation in the history sidebar to switch to it
- **Delete Chat**: Hover over a conversation and click the trash icon (with confirmation)
- **Export Chat**: Hover over a conversation and click the download icon to export as JSON
- **Import Chat**: Click "Import Chat" button to import a previously exported conversation

### 4. Conversation Limit
- Maximum of 10 conversations to prevent excessive storage use
- Visual indicator shows current count (e.g., "5 / 10 chats")
- Warning message appears when limit is reached
- Must delete existing conversations to create new ones

### 5. Export/Import
- Export includes: conversation metadata, all messages, and all files
- Export format: JSON file with timestamp
- Import creates a new conversation (marked as "imported")
- Imported conversations count toward the 10 conversation limit

## Database Schema

### Tables

**conversations**
- `id`: UUID primary key
- `title`: Text (auto-generated from first message)
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updates)

**chat_messages**
- `id`: UUID primary key
- `conversation_id`: Foreign key to conversations
- `role`: 'user' or 'assistant'
- `content`: Message text
- `created_at`: Timestamp

**conversation_files**
- `id`: UUID primary key
- `conversation_id`: Foreign key to conversations
- `name`: File name
- `content`: File content
- `language`: Programming language
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updates)

### Cascade Deletes
When a conversation is deleted, all related messages and files are automatically removed.

## User Flow

### Starting a New Chat
1. Click "New Chat" button in the sidebar
2. System resets to empty state with default welcome file
3. Type a message to the AI
4. Conversation is automatically created when first message is sent
5. Conversation appears in the sidebar history

### Switching Conversations
1. Click any conversation in the sidebar
2. System loads all messages and files for that conversation
3. File editor updates with the conversation's files
4. Chat displays the conversation history

### Exporting a Conversation
1. Hover over a conversation in the sidebar
2. Click the download icon
3. JSON file downloads with all conversation data
4. File can be shared or backed up

### Importing a Conversation
1. Click "Import Chat" button
2. Select a previously exported JSON file
3. System creates new conversation with imported data
4. Imported conversation opens automatically

## Technical Implementation

### File System Hook
`useFileSystem(conversationId?: string)`
- Accepts optional conversation ID
- Loads files from Supabase when conversation ID changes
- Auto-saves changes to database
- Returns default files for new conversations

### Chat Component
- Manages message state and AI interactions
- Creates conversations automatically on first message
- Notifies parent component when conversation is created
- Handles file operations from AI responses

### ChatHistory Component
- Real-time subscription to conversation changes
- Enforces 10 conversation limit
- Handles export/import functionality
- Confirmation dialog for deletions

### Studio Component
- Coordinates conversation state
- Manages file system with current conversation ID
- Shows loading state when switching conversations
- Handles all conversation lifecycle events

## Best Practices

1. **Regular Exports**: Export important conversations for backup
2. **Clean Up**: Delete old conversations to stay under the limit
3. **Descriptive First Messages**: First message becomes conversation title
4. **File Management**: Use the AI to organize files within conversations
5. **Switching**: Files auto-save, but wait for operations to complete before switching

## Troubleshooting

### Conversation Won't Load
- Check database connection
- Verify conversation exists in Supabase
- Check browser console for errors

### Files Not Saving
- Ensure conversation is created (not in new chat state)
- Check Supabase permissions
- Verify database connection

### Export/Import Issues
- Ensure JSON file is properly formatted
- Check conversation limit before importing
- Verify file permissions for downloads

## Future Enhancements

Potential improvements for the chat system:
- Search conversations by title or content
- Tags and categories for conversations
- Collaborative conversations (multi-user)
- Automatic backup scheduling
- Cloud sync across devices
- Conversation templates
- Favorite/pin conversations
- Archive instead of delete
