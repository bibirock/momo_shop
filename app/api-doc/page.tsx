"use client";

import SwaggerUI from "swagger-ui-react";

export default function ApiDocPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags -- Keep vendor CSS out of Turbopack's PostCSS pipeline. */}
      <link rel="stylesheet" href="/swagger-ui.css" />
      <SwaggerUI url="/openapi.json" deepLinking />
    </>
  );
}
