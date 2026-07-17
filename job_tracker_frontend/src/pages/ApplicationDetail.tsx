import { useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "../api/axios.ts";

const ApplicationDetail = () => {
  const { id } = useParams();

  return <div>ApplicationDetail</div>;
};

export default ApplicationDetail;
