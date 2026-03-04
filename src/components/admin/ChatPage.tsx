import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Send, Paperclip, Smile, ThumbsUp, Heart } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  isActive?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'sent' | 'received' | 'deleted';
  text: string;
  sender?: string;
  timestamp?: string;
  avatar?: string;
  replies?: number;
  reactions?: string[];
}

const AVATAR_COLORS: Record<string, string> = {
  C: '#6366f1',
  S: '#0ea5e9',
  P: '#f97316',
  T: '#ef4444',
  Q: '#8b5cf6',
};

function Avatar({
  letter,
  color,
  size = 32,
  className = '',
}: {
  letter: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const bg = color ?? AVATAR_COLORS[letter.toUpperCase()] ?? '#6b7280';
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.4 }}
    >
      {letter.toUpperCase()}
    </div>
  );
}

const CHANNELS: Channel[] = [
  { id: '1', name: 'Cubbo_Partrunner', avatar: 'C', lastMessage: 'Nothing yet...' },
  { id: '2', name: 'SAMS_PEUBLA_PR', avatar: 'S', lastMessage: 'Hello' },
  { id: '3', name: 'Partrunner_Apymsa_Drivers', avatar: 'P', lastMessage: 'Nothing yet...' },
  { id: '4', name: 'Talking about Angular', avatar: 'T', lastMessage: 'Hello Team', isActive: true },
  { id: '5', name: 'Cubbo_QRO', avatar: 'Q', lastMessage: 'Nothing yet...' },
];

const MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'sent',
    text: 'Image attached.',
    timestamp: 'Today at 11:41 AM',
    avatar: 'U',
  },
  {
    id: '2',
    type: 'received',
    text: 'Received.',
    sender: 'Still-Star-7',
    timestamp: 'Today at 11:43 AM',
    avatar: 'S',
    replies: 1,
  },
  {
    id: '3',
    type: 'sent',
    text: 'Ok',
    avatar: 'U',
  },
  {
    id: '4',
    type: 'sent',
    text: 'We have 3 members here',
    avatar: 'U',
  },
  {
    id: '5',
    type: 'sent',
    text: 'Received',
    avatar: 'U',
  },
  {
    id: '6',
    type: 'sent',
    text: 'Okay',
    avatar: 'U',
  },
  {
    id: '7',
    type: 'deleted',
    text: 'This Message Was Deleted...',
    timestamp: 'Today at 1:23 AM',
    avatar: 'U',
    reactions: ['👍', '❤️'],
  },
  {
    id: '8',
    type: 'received',
    text: 'Received.',
    sender: 'partrunner',
    timestamp: 'Today at 1:38 AM',
    avatar: 'P',
  },
];

function ChannelList({
  channels,
  activeId,
  onSelect,
}: {
  channels: Channel[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="w-[300px] shrink-0 bg-pr-surface-warm flex flex-col border-r border-pr-outline">
      <div className="p-4 font-bold text-sm text-pr-text-muted uppercase tracking-wider">
        Channels
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              ch.id === activeId
                ? 'bg-pr-yellow-alt'
                : 'hover:bg-pr-surface-warm'
            }`}
          >
            <Avatar
              letter={ch.avatar}
              color={ch.id === activeId ? '#000' : undefined}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold truncate ${
                  ch.id === activeId ? 'text-black' : 'text-pr-black'
                }`}
              >
                {ch.name}
              </p>
              <p
                className={`text-xs truncate ${
                  ch.id === activeId ? 'text-black/60' : 'text-pr-text-muted'
                }`}
              >
                {ch.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AngularIcon({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      A
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isSent = message.type === 'sent';
  const isDeleted = message.type === 'deleted';

  if (isDeleted) {
    return (
      <div className="flex flex-col items-end gap-1">
        {message.timestamp && (
          <span className="text-[11px] text-pr-text-muted px-1">{message.timestamp}</span>
        )}
        <div className="flex items-end gap-2">
          <div className="bg-pr-yellow-alt/[0.26] rounded-xl px-4 py-2.5 max-w-md">
            <p className="text-sm text-pr-text-muted italic">{message.text}</p>
          </div>
          <Avatar letter={message.avatar ?? 'U'} color="#FBD232" size={28} />
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center gap-1 mr-10">
            {message.reactions.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 bg-pr-surface-warm rounded-full px-2 py-0.5 text-xs"
              >
                {r === '👍' && <ThumbsUp size={12} className="text-pr-text-muted" />}
                {r === '❤️' && <Heart size={12} className="text-pr-danger" />}
                {r !== '👍' && r !== '❤️' && r}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-end gap-1">
        {message.timestamp && (
          <span className="text-[11px] text-pr-text-muted px-1">{message.timestamp}</span>
        )}
        <div className="flex items-end gap-2">
          <div className="bg-pr-yellow-alt/[0.26] rounded-xl px-4 py-2.5 max-w-md">
            <p className="text-sm text-pr-text-dark">{message.text}</p>
          </div>
          <Avatar letter={message.avatar ?? 'U'} color="#FBD232" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {message.sender && (
        <span className="text-[11px] text-pr-text-muted ml-10">
          {message.sender}
          {message.timestamp && <span className="text-pr-text-muted"> {message.timestamp}</span>}
        </span>
      )}
      <div className="flex items-end gap-2">
        <Avatar
          letter={message.avatar ?? message.sender?.[0] ?? '?'}
          size={28}
        />
        <div className="border border-pr-yellow-alt rounded-xl px-4 py-2.5 max-w-md">
          <p className="text-sm text-pr-text-dark">{message.text}</p>
        </div>
      </div>
      {message.replies != null && message.replies > 0 && (
        <button className="ml-10 text-xs text-pr-link hover:underline">
          {message.replies} reply
        </button>
      )}
    </div>
  );
}

export function ChatPage() {
  const [activeChannelId, setActiveChannelId] = useState('4');
  const [inputValue, setInputValue] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelId]);

  return (
    <div className="flex-1 flex flex-col bg-pr-surface-light font-ui overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-end px-6 py-3">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 text-sm text-pr-text-secondary hover:text-pr-black transition-colors"
          >
            <Globe size={16} />
            <span className="font-medium">EN</span>
            <ChevronDown size={14} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-pr-outline py-1 z-50 min-w-[100px]">
              {['EN', 'ES', 'PT'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLangOpen(false)}
                  className="block w-full text-left px-4 py-1.5 text-sm text-pr-black hover:bg-pr-surface-warm/70"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4">
        <ChannelList
          channels={CHANNELS}
          activeId={activeChannelId}
          onSelect={setActiveChannelId}
        />

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden shadow-sm">
          {/* Channel header */}
          <div className="bg-pr-yellow-alt/[0.26] px-5 py-3 flex items-center gap-3 rounded-t-xl">
            <AngularIcon size={36} />
            <div>
              <p className="text-sm font-bold text-pr-black">
                {activeChannel?.name ?? 'Select a channel'}
              </p>
              <p className="text-xs text-pr-text-muted">3 members &middot; 1 online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
            {MESSAGES.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-pr-outline/50 px-4 py-3 flex items-center gap-3">
            <button className="p-1.5 text-pr-text-muted hover:text-pr-text-secondary transition-colors">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-sm bg-pr-surface-warm rounded-lg px-4 py-2 border border-pr-outline outline-none focus:border-pr-yellow-alt focus:ring-1 focus:ring-pr-yellow-alt/40 transition-all placeholder:text-pr-text-muted"
            />
            <button className="p-1.5 text-pr-text-muted hover:text-pr-text-secondary transition-colors">
              <Smile size={18} />
            </button>
            <button className="p-2 bg-pr-yellow-alt rounded-lg hover:bg-pr-yellow-alt/80 transition-colors">
              <Send size={16} className="text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
