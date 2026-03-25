type NotesPanelProps = {
  notes: string;
  setNotes: (v: string) => void;
  onBlur: () => void;
  readOnly?: boolean;
};

export function NotesPanel({ notes, setNotes, onBlur, readOnly }: NotesPanelProps) {
  return (
    <div className="panel-body">
      {readOnly ? (
        <div className="notes-readonly">
          {notes || <span className="text-muted">No notes.</span>}
        </div>
      ) : (
        <textarea
          className="notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={onBlur}
          placeholder="Session notes, reminders, conditions, house rules..."
          rows={8}
        />
      )}
    </div>
  );
}
