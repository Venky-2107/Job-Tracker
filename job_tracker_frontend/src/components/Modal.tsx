import { useState, useEffect } from "react";
import instance from "../api/axios.ts";
import type { Application, Contact, Note } from "../types";
import ContactForm from "./ContactForm.tsx";
import NotesForm from "./NotesForm.tsx";

interface ModalProps {
  application: Application;
  onClose: () => void;
  statusEmoji: Record<string, string>;
}

type ActiveTab = "details" | "contacts" | "notes";

const Modal = (props: ModalProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
  const [isContactEdit, setIsContactEdit] = useState(false);
  const [isNoteEdit, setIsNoteEdit] = useState(false);
  const [contactPayload, setContactPayload] = useState<Record<string, string>>(
    {},
  );
  const [notePayload, setNotePayload] = useState<Record<string, string>>({});
  // const [contactForm, setContactForm] = useState<Contact>({
  //   name: "",
  //   email: "",
  //   phone: "",
  //   social_url: "",
  // });
  // const [noteForm, setNoteForm] = useState<Note>({
  //   round: "",
  //   interview_date: "",
  //   notes: "",
  // });
  const applicationId = props.application.id;

  const fetchContacts = async (app_id: number) => {
    try {
      const response = await instance.get(`/application/${app_id}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.log("something wrong in fetching the contact");
    }
  };

  const fetchNotes = async (app_id: number) => {
    try {
      const response = await instance.get(`/application/${app_id}/notes`);
      setNotes(response.data);
      console.log("notes response", response.data);
    } catch (error) {
      console.log("something wrong in fetching the Notes");
    }
  };

  useEffect(() => {
    fetchContacts(applicationId);
    fetchNotes(applicationId);
  }, [showContactForm, showNoteForm]);

  useEffect(() => {
    setShowContactForm(false);
    setShowNoteForm(false);
  }, [activeTab]);

  const handleDelete = async (item: string, id: number) => {
    console.log(item, id);
    try {
      await instance.delete(`/application/${applicationId}/${item}/${id}`);
      item === "contacts"
        ? setContacts(contacts.filter((contact) => contact.id !== id))
        : setNotes(notes.filter((contact) => contact.id !== id));
    } catch (error) {
      console.log(`some issue while deleting the ${item} `);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
      onClick={props.onClose}
    >
      {/* Modal box - stop click propagation so clicking inside doesn't close */}
      <div
        className="flex flex-col bg-gray-400 rounded-2xl p-4 w-[600px] min-h-[40vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <button
          className="w-6 h-6 self-end bg-red-500 rounded-3xl text-white hover:cursor-pointer hover:bg-red-700"
          onClick={props.onClose}
        >
          X
        </button>

        {/* tabs */}
        <div className="flex gap-2 mx-2">
          <button onClick={() => setActiveTab("details")}>Details</button>
          <button onClick={() => setActiveTab("contacts")}>Contacts</button>
          <button onClick={() => setActiveTab("notes")}>Notes</button>
        </div>

        {/* Application details */}

        {activeTab === "details" && (
          <section>
            <div className="flex justify-between items-start p-2">
              <h3
                className="text-base font-bold text-gray-800 truncate max-w-[160px]"
                title={props.application.company_name}
              >
                🏢 {props.application.company_name}
              </h3>
              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-medium">
                {props.application.portal}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1 text-sm text-gray-600 p-2">
              <span>🏷️ {props.application.role}</span>
              <span>
                {props.statusEmoji[props.application.application_status] ??
                  "📋"}{" "}
                {props.application.application_status}
              </span>
              <span>📅 {props.application.date_applied}</span>
              {props.application.date_of_interview !== "N/A" && (
                <span>🗓️ Interview: {props.application.date_of_interview}</span>
              )}
            </div>
          </section>
        )}

        {/* Contacts section */}

        {activeTab === "contacts" && (
          <>
            {/* add notes and contact button */}
            <section>
              {!showContactForm && (
                <button
                  onClick={() => {
                    setShowContactForm(true);
                    setIsContactEdit(false);
                    setContactPayload({});
                  }}
                >
                  Add Contact
                </button>
              )}
            </section>
            {showContactForm === true ? (
              <ContactForm
                isEdit={isContactEdit}
                payload={contactPayload}
                applicationId={props.application.id}
                setShowContactForm={setShowContactForm}
              />
            ) : (
              <section>
                {contacts.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items w-fit border border-gray-900"
                  >
                    <span>{item.name}</span>
                    <span>{item.email}</span>
                    <span>{item.phone}</span>
                    <span>{item.social_url}</span>
                    <button
                      className="text-red-300"
                      onClick={() => {
                        setContactPayload({
                          name: item.name ?? "",
                          email: item.email ?? "",
                          phone: item.phone ?? "",
                          social_url: item.social_url ?? "",
                        });
                        setIsContactEdit(true);
                        setShowContactForm(true);
                      }}
                    >
                      edit
                    </button>
                    <button
                      className="text-red-300"
                      onClick={() => handleDelete("contacts", item.id)}
                    >
                      --delete--
                    </button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}

        {/* Notes section */}
        {activeTab === "notes" && (
          <>
            {/* add notes and contact button */}
            <section>
              {!showNoteForm && (
                <button
                  onClick={() => {
                    setShowNoteForm(true);
                    setIsNoteEdit(false);
                    setNotePayload({});
                  }}
                >
                  Add Note
                </button>
              )}
            </section>
            {showNoteForm === true ? (
              <NotesForm
                isEdit={isNoteEdit}
                payload={notePayload}
                applicationId={props.application.id}
                setShowNoteForm={setShowNoteForm}
              />
            ) : (
              <section>
                {notes.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items w-fit border border-gray-900"
                  >
                    <span>{item.round}</span>
                    <span>{item.interview_date}</span>
                    <span>{item.notes}</span>
                    <button
                      className="text-red-300"
                      onClick={() => {
                        setNotePayload({
                          id: String(item.id) ?? "",
                          round: item.round ?? "",
                          interview_date: item.interview_date ?? "",
                          notes: item.notes ?? "",
                        });
                        setIsNoteEdit(true);
                        setShowNoteForm(true);
                      }}
                    >
                      edit
                    </button>
                    <button
                      className="text-red-300"
                      onClick={() => handleDelete("notes", item.id)}
                    >
                      --delete--
                    </button>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
