// pages/FormPage.tsx or wherever you define it
import { useParams } from "react-router-dom";
import FormCollaborator from "../pages/FormCollabolator"; // adjust path
import { useEffect, useState } from "react";

export default function FormPage() {
  const { formId } = useParams();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Optional: Get token from localStorage or auth context
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  if (!formId) return <div>Invalid form</div>;

  return <FormCollaborator formId={formId} token={token} />;
}
