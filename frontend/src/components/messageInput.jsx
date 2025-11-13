import { useCallback, useState } from 'react';

function MessageInput({ onSend, participants = [], currentUserId }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

    const recipients = participants && participants.length > 0
        ? participants.filter(p => String(p) !== String(currentUserId))
        : [];

    const handleChange = (e) => {
        setText(e.target.value);
    };

  const handleSend = useCallback(async () => {
    if (!text.trim()) return;
    if (sending) return;
    setSending(true);
    try {
      if (typeof onSend === 'function') {
        await onSend({ text: text.trim(), recipients });
      }
      setText('');
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
    }
  }, [text, onSend, recipients, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        className="flex-1 p-2 rounded border resize-none h-12"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {sending ? 'Enviando...' : 'Enviar'}
      </button>
    </div>
  );
}

export default MessageInput;
