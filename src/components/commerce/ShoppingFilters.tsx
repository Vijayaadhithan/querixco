import { useState } from "react";
import type { Commerce, Task } from "@/features/commerce/model";

const fields = [
  "maximum price",
  "minimum price",
  "size",
  "color",
  "material",
  "style",
  "scent",
] as const;
type Field = (typeof fields)[number];
function valueOf(task: Task, field: Field): string {
  const value =
    field === "maximum price"
      ? task.filters.max_price
      : field === "minimum price"
        ? task.filters.min_price
        : task.filters.attributes?.[field];
  return value == null ? "" : String(value);
}
function command(task: Task, field: Field, value: string) {
  if (!value) return `For task ${task.id}, remove ${field}`;
  return `For task ${task.id}, set ${field} to ${field.endsWith("price") ? "$" : ""}${value}`;
}

export function ShoppingFilters({
  current,
  previous,
  previousEdit,
  disabled,
  onSend,
}: {
  current: Commerce["preferences"];
  previous?: Commerce["preferences"];
  previousEdit?: string;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const active = current.tasks.find((t) => t.id === current.active_task_id) ?? current.tasks[0];
  const [selected, setSelected] = useState<number | null>(null);
  const task = current.tasks.find((t) => t.id === selected) ?? active;
  const [editing, setEditing] = useState<Field | null>(null);
  const [value, setValue] = useState("");
  if (!task) return null;
  const prior = previous?.tasks.find(
    (t) =>
      t.id === task.id &&
      (t.query === task.query || previousEdit?.startsWith(`For task ${task.id}, `)),
  );
  const changes = prior ? fields.filter((f) => valueOf(task, f) !== valueOf(prior, f)) : [];
  const undo = changes.length === 1 ? changes[0] : null;
  const valid = editing?.endsWith("price")
    ? /^\d{1,12}(?:\.\d{1,2})?$/.test(value.trim())
    : !!value.trim();
  function apply(text: string) {
    setEditing(null);
    onSend(text);
  }
  return (
    <section className="shopping-filters" aria-label="Edit shopping preferences">
      <div className="shopping-filter-row">
        {current.tasks.length > 1 ? (
          <select
            aria-label="Shopping item to edit"
            value={task.id}
            disabled={disabled}
            onChange={(e) => {
              setSelected(Number(e.target.value));
              setEditing(null);
            }}
          >
            {current.tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.query || `Item ${t.id}`}
                {t.recipient ? ` · ${t.recipient}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <strong>{task.query || "Current search"}</strong>
        )}
        {fields
          .filter((f) => valueOf(task, f))
          .map((f) => (
            <button
              key={f}
              type="button"
              disabled={disabled}
              aria-label={`Edit ${f}: ${valueOf(task, f)}`}
              onClick={() => {
                setEditing(f);
                setValue(valueOf(task, f));
              }}
            >
              {f === "maximum price" ? "Max $" : f === "minimum price" ? "Min $" : f + " "}
              {valueOf(task, f)}
            </button>
          ))}
        {undo && prior && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => apply(command(task, undo, valueOf(prior, undo)))}
          >
            Undo {undo} change
          </button>
        )}
      </div>
      {editing && (
        <form
          className="shopping-filter-edit"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !disabled) apply(command(task, editing, value.trim()));
          }}
        >
          <label>
            {editing}
            <input
              autoFocus
              maxLength={120}
              value={value}
              disabled={disabled}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button type="submit" disabled={!valid || disabled}>
            Apply
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => apply(command(task, editing, ""))}
          >
            Remove
          </button>
          <button type="button" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </form>
      )}
    </section>
  );
}
