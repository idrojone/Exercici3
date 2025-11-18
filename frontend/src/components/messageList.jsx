import { useEffect, useRef } from 'react';

function MessageList({ messages = [], currentUserName }) {
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    try {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    } catch (e) {
    }
  }, [messages]);

  return (
    // console.log(messages),
    <div ref={containerRef} className="w-full h-full">
      <div className="flex flex-col gap-3">
        {messages.map((m, idx) => {
          const key = m._id || `${m.sender}-${m.createdAt}-${idx}`;
          const isLast = idx === messages.length - 1;
          const mine = m.senderName && currentUserName && String(m.senderName) === String(currentUserName);
          const displayName = m.senderName;

          return (
            <div key={key} ref={isLast ? lastMessageRef : null} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg ${mine ? 'bg-blue-100 text-black' : 'bg-red-100 text-black'}`}>
                <div className="text-sm font-semibold mb-1">{displayName}</div>
                {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MessageList;
