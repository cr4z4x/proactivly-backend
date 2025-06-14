import { useParams } from "react-router-dom";
import FormCollaborator from "./FormCollabolator";

function FormCollaboratorWrapper() {
  const { formId } = useParams(); // ✅ Must be inside a functional component
  const token = localStorage.getItem("token") || "";

  if (!formId) {
    return <div>Missing form ID</div>; // Only shown if URL is wrong
  }

  return <FormCollaborator formId={formId} token={token} />;
}

export default FormCollaboratorWrapper;
