// Quoted preview of the message being replied to.
// Placeholder structure — full implementation in Phase 10.
export default function ReplyPreview({ message, onCancel }) {
  return message ? (
    <div className="flex items-start justify-between gap-2 border-l-2 border-primary bg-muted/50 px-3 py-2 text-sm">
      <p className="line-clamp-2 text-muted-foreground">{message.content}</p>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      )}
    </div>
  ) : null
}
