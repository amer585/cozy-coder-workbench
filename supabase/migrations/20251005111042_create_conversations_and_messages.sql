/*
  # Create Conversations and Chat System

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key, auto-generated)
      - `title` (text, required) - Title/summary of the conversation
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `chat_messages`
      - `id` (uuid, primary key, auto-generated)
      - `conversation_id` (uuid, foreign key to conversations)
      - `role` (text, required) - Either 'user' or 'assistant'
      - `content` (text, required) - The message content
      - `created_at` (timestamptz, default now)
    
    - `conversation_files`
      - `id` (uuid, primary key, auto-generated)
      - `conversation_id` (uuid, foreign key to conversations)
      - `name` (text, required) - File name with extension
      - `content` (text, default '') - File content
      - `language` (text, default 'javascript') - Programming language
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no auth required for MVP)
    - Policies allow full CRUD operations

  3. Indexes
    - Index on conversation_id for fast lookups
    - Index on updated_at for sorting conversations

  4. Important Notes
    - Cascade delete: When a conversation is deleted, all related messages and files are automatically deleted
    - updated_at automatically updates on conversation changes
    - All tables use uuid for primary keys
    - Default values prevent null errors
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create conversation_files table
CREATE TABLE IF NOT EXISTS conversation_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text DEFAULT '',
  language text DEFAULT 'javascript',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_files_conversation_id ON conversation_files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_files ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations (public access for MVP)
CREATE POLICY "Allow public read access to conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to conversations"
  ON conversations FOR DELETE
  TO public
  USING (true);

-- Create policies for chat_messages (public access for MVP)
CREATE POLICY "Allow public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to chat_messages"
  ON chat_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to chat_messages"
  ON chat_messages FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to chat_messages"
  ON chat_messages FOR DELETE
  TO public
  USING (true);

-- Create policies for conversation_files (public access for MVP)
CREATE POLICY "Allow public read access to conversation_files"
  ON conversation_files FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to conversation_files"
  ON conversation_files FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to conversation_files"
  ON conversation_files FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to conversation_files"
  ON conversation_files FOR DELETE
  TO public
  USING (true);

-- Create trigger to update updated_at on conversations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_files_updated_at
  BEFORE UPDATE ON conversation_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();