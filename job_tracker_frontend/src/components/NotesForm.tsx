import InputField from "./InputField.tsx";
import { useState, useEffect } from "react";
import instance from "../api/axios.ts";
import type { ChangeEvent } from "react";

interface noteFormProps {
  isEdit: boolean;
  payload: Record<string, string>;
  applicationId: number;
  setShowNoteForm: (value: boolean) => void;
}

const NotesForm = (props: noteFormProps) => {
  const [noteData, setNoteData] = useState({
    round: "",
    interview_date: "",
    notes: "",
  });

  const handleNotesForm = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.id;
    setNoteData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    if (props.isEdit) {
      setNoteData({
        round: props.payload.round ?? "",
        interview_date: props.payload.interview_date ?? "",
        notes: props.payload.notes ?? "",
      });
    } else {
      setNoteData({
        round: "",
        interview_date: "",
        notes: "",
      });
    }
  }, [props.isEdit, props.payload]);

  const handleNoteCreateOrUpdate = async (data: typeof noteData) => {
    const payload = {
      round: data.round ?? "",
      interview_date: data.interview_date ?? "",
      notes: data.notes ?? "",
    };

    try {
      if (props.isEdit && props.applicationId) {
        // edit mode → PUT
        await instance.put(
          `/application/${props.applicationId}/notes/${props.payload.id}`,
          payload,
        );
        console.log("Note updated !!!");
      } else {
        // create mode → POST
        await instance.post(
          `/application/${props.applicationId}/notes`,
          payload,
        );
      }
    } catch (error: any) {
      console.log(
        "SOmething went wrong here",
        error.response?.data?.detail || error.message,
      );
    } finally {
      props.setShowNoteForm(false);
    }
  };

  return (
    <div className="flex flex-col ml-2">
      <InputField
        type="text"
        placeholder="Round"
        id="round"
        value={noteData.round}
        handleChange={handleNotesForm}
      />
      <InputField
        type="date"
        placeholder="Date of Interview"
        id="interview_date"
        value={noteData.interview_date}
        handleChange={handleNotesForm}
      />
      <InputField
        type="text"
        placeholder="Notes"
        id="notes"
        value={noteData.notes}
        handleChange={handleNotesForm}
      />

      <button
        className="self-start ml-2"
        onClick={() => handleNoteCreateOrUpdate(noteData)}
      >
        {props.isEdit ? "Update" : "Create"}
      </button>
    </div>
  );
};

export default NotesForm;
