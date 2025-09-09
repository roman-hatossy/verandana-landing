"use client";
import dynamic from "next/dynamic";

const InquiryForm = dynamic(() => import("./InquiryForm"), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
});

export default function FormSection() {
  return (
    <section id="form" className="pt-16">
      <InquiryForm />
    </section>
  );
}
