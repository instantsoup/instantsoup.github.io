type NotesPanelProps = {
  notes: string;
  setNotes: (v: string) => void;
  onBlur: () => void;
};

export function NotesPanel({ notes, setNotes, onBlur }: NotesPanelProps) {
  return (
    <div className="panel-body">
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={onBlur}
        placeholder="Session notes, reminders, conditions, house rules..."
        rows={8}
      />
    </div>
  );
}
