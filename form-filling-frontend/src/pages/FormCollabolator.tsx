import { useEffect, useState } from "react";
import io from "socket.io-client";

interface Field {
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Props {
  formId: string;
  token: string;
}

const socket = io("http://localhost:3000", {
  path: "/formanswer",
  auth: {
    token: localStorage.getItem("token") || "",
  },
});

export default function FormCollaborator({ formId }: Props) {
  const [fields, setFields] = useState<Field[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [locks, setLocks] = useState<
    Record<string, { userId: string; name: string }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    socket.emit("join-form", { formId });

    socket.on("form-init", ({ schema, answers, userId }) => {
      setFields(schema);
      setAnswers(answers);
      setCurrentUserId(userId);
    });

    socket.on("lock-field", ({ field, userId, name }) => {
      if (!userId) {
        setLocks((prev) => {
          const newLocks = { ...prev };
          delete newLocks[field];
          return newLocks;
        });
      } else {
        setLocks((prev) => ({
          ...prev,
          [field]: { userId, name },
        }));
      }
    });

    socket.on("update-answer", ({ field, value }) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
    });

    socket.on("field-locked", ({ field, name }) => {
      setLocks((prev) => ({
        ...prev,
        [field]: { userId: "unknown", name },
      }));
    });

    socket.on("submission-success", ({ message }) => alert(message));
    socket.on("error", ({ message }) => setError(message));

    return () => {
      socket.off();
    };
  }, [formId]);

  const handleFocus = (fieldLabel: string) => {
    socket.emit("lock-field", { formId, field: fieldLabel });
  };

  const handleChange = (fieldLabel: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldLabel]: value }));
    socket.emit("update-answer", { formId, field: fieldLabel, value });
  };

  const handleSubmit = () => {
    socket.emit("submit-form", { formId });
  };

  const renderField = (field: Field) => {
    const label = field.label;
    const value = answers[label] || "";
    const lock = locks[label];
    const isLocked = lock && lock.userId !== currentUserId;

    if (field.type === "textarea") {
      return (
        <textarea
          value={value}
          onFocus={() => handleFocus(label)}
          onChange={(e) => handleChange(label, e.target.value)}
          disabled={isLocked}
          className="p-2 border rounded"
        />
      );
    }

    if (field.type === "radio" && field.options) {
      return field.options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="radio"
            value={option}
            checked={value === option}
            onFocus={() => handleFocus(label)}
            onChange={() => handleChange(label, option)}
            disabled={isLocked}
          />
          {option}
        </label>
      ));
    }

    if (field.type === "checkbox" && field.options) {
      const current = Array.isArray(value) ? value : [];
      return field.options.map((option) => (
        <label key={option} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={current.includes(option)}
            onChange={() => {
              const newValue = current.includes(option)
                ? current.filter((o) => o !== option)
                : [...current, option];
              handleChange(label, newValue);
            }}
            onFocus={() => handleFocus(label)}
            disabled={isLocked}
          />
          {option}
        </label>
      ));
    }

    return (
      <input
        type={field.type}
        value={value}
        onFocus={() => handleFocus(label)}
        onChange={(e) => handleChange(label, e.target.value)}
        disabled={isLocked}
        className="p-2 border rounded"
      />
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto shadow rounded bg-white">
      <h2 className="text-2xl font-bold mb-4">Live Collaborative Form</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col">
            <label className="text-sm font-semibold mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {locks[field.label] &&
              locks[field.label].userId !== currentUserId && (
                <small className="text-xs text-gray-500">
                  Locked by {locks[field.label].name}
                </small>
              )}
            {locks[field.label] &&
              locks[field.label].userId === currentUserId && (
                <small className="text-xs text-green-500">
                  You are editing
                </small>
              )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
