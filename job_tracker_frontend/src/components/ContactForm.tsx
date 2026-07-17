import InputField from "./InputField.tsx";
import { useState, useEffect } from "react";
import instance from "../api/axios.ts";
import type { ChangeEvent } from "react";

interface contactFormProps {
  isEdit: boolean;
  payload: Record<string, string>;
  applicationId: number;
  setShowContactForm: (value: boolean) => void;
}

const ContactForm = (props: contactFormProps) => {
  const [contactData, setContactData] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    social_url: "",
  });

  const handleContactForm = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.id;
    setContactData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    if (props.isEdit) {
      setContactData({
        id: props.payload.id ?? "",
        name: props.payload.name ?? "",
        email: props.payload.email ?? "",
        phone: props.payload.phone ?? "",
        social_url: props.payload.social_url ?? "",
      });
    } else {
      setContactData({
        id: "",
        name: "",
        email: "",
        phone: "",
        social_url: "",
      });
    }
  }, [props.isEdit, props.payload]);

  const handleContactCreateOrUpdate = async (data: typeof contactData) => {
    const payload = {
      name: data.name ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      social_url: data.social_url ?? "",
    };

    try {
      if (props.isEdit && props.applicationId) {
        // edit mode → PUT
        await instance.put(
          `/application/${props.applicationId}/contacts/${props.payload.id}`,
          payload,
        );
        console.log("contact updated !!!");
      } else {
        // create mode → POST
        await instance.post(
          `/application/${props.applicationId}/contacts`,
          payload,
        );
      }
    } catch (error: any) {
      console.log(
        "SOmething went wrong here",
        error.response?.data?.detail || error.message,
      );
    } finally {
      props.setShowContactForm(false);
    }
  };

  return (
    <div className="flex flex-col ml-2">
      <InputField
        type="text"
        placeholder="Name"
        id="name"
        value={contactData.name}
        handleChange={handleContactForm}
      />
      <InputField
        type="text"
        placeholder="Email"
        id="email"
        value={contactData.email}
        handleChange={handleContactForm}
      />
      <InputField
        type="number"
        placeholder="Phone"
        id="phone"
        value={contactData.phone}
        handleChange={handleContactForm}
      />
      <InputField
        type="text"
        placeholder="URL"
        id="social_url"
        value={contactData.social_url}
        handleChange={handleContactForm}
      />

      <button
        className="self-start ml-2"
        onClick={() => handleContactCreateOrUpdate(contactData)}
      >
        {props.isEdit ? "Update" : "Create"}
      </button>
    </div>
  );
};

export default ContactForm;
