// Image thumbnail or file card for message attachments.
// Placeholder structure — full implementation in Phase 11.
export default function AttachmentPreview({ attachment }) {
  return attachment ? (
    <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm underline">
      {attachment.name}
    </a>
  ) : null
}
