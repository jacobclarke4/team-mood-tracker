
'use client';
import { useState } from "react";
import CheckinForm from "./components/CheckIn/CheckInForm";

export default function Page() {
  const [reload, setReload] = useState(0);
  return (
    <>
      <CheckinForm onSubmitted={() => setReload((r) => r + 1)} />
      <hr />
    </>
  );
}
