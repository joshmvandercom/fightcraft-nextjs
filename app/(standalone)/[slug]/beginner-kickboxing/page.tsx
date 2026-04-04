"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getLead } from "@/lib/lead";
import BeginnerModal from "./BeginnerModal";

const LOCATION_DATA: Record<
  string,
  { name: string; address: string; city: string; state: string; zip: string }
> = {
  "san-jose": {
    name: "San Jose",
    address: "1825 W. San Carlos St.",
    city: "San Jose",
    state: "CA",
    zip: "95128",
  },
  merced: {
    name: "Merced",
    address: "2844 G St",
    city: "Merced",
    state: "CA",
    zip: "95430",
  },
  brevard: {
    name: "Brevard",
    address: "69 West French Broad",
    city: "Brevard",
    state: "NC",
    zip: "28712",
  },
};

function getDeadline(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${days[tomorrow.getDay()]}, ${months[tomorrow.getMonth()]} ${tomorrow.getDate()}`;
}

export default function BeginnerOfferPage() {
  const params = useParams();
  const slug = params.slug as string;
  const loc = LOCATION_DATA[slug] || LOCATION_DATA["san-jose"];
  const deadline = getDeadline();
  const [firstName, setFirstName] = useState(() => {
    if (typeof window === "undefined") return "";
    const lead = getLead();
    return lead?.name ? lead.name.split(" ")[0] : "";
  });

  useEffect(() => {
    import("@/lib/lead").then(({ getLeadWithSid, hasSidParam }) => {
      if (!hasSidParam() && firstName) return;
      getLeadWithSid().then((lead) => {
        if (lead?.name) setFirstName(lead.name.split(" ")[0]);
      });
    });
  }, []);

  function openModal() {
    window.dispatchEvent(new Event("open-beginner-modal"));
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Urgency banner */}
      <div className="bg-red-500 text-white text-center py-2 px-4">
        <p className="font-heading text-xs md:text-sm uppercase tracking-widest font-bold">
          Last day to register: {deadline}
        </p>
      </div>

      {/* Hero + split image */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-black" />

        <div className="relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center pt-4 md:pt-6 pb-4">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl uppercase font-bold tracking-tight text-white mb-1 leading-[1.1]">
              {firstName ? <><span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">{firstName}</span>, ready to start kickboxing?</> : <>Beginner Friendly<br />Kickboxing Program</>}
            </h1>
            <p className="text-base md:text-xl text-white/80">
              For working professionals, no experience required.
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src="/images/home/kickboxing.jpg"
              alt="FightCraft Kickboxing Class"
              className="w-full max-w-xl shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="text-black pt-4 pb-6 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-base mb-3">👋 Hey{firstName ? ` ${firstName}` : ''}, Coach Josh here.</p>

          <p className="text-sm mb-1">
            We&apos;re opening <strong>9 spots</strong> for{" "}
            <u>working professionals</u> who want
          </p>
          <p className="text-sm mb-4">
            <strong>
              <em>structured training</em>
            </strong>{" "}
            in a fun and safe environment.
          </p>

          <p className="text-sm font-bold mb-1">
            Build a routine that challenges you.
          </p>
          <p className="text-sm mb-5">
            Train in a way that challenges the body and <em>frees the mind</em>.
          </p>

          {/* CTA */}
          <button
            onClick={openModal}
            className="w-full max-w-sm mx-auto py-3 px-6 bg-black text-white rounded-2xl hover:bg-black/80 transition-colors cursor-pointer block mb-3"
          >
            <span className="font-heading text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
              Book Free Consultation
            </span>
            <span className="text-xs text-white/60 uppercase tracking-widest">
              Limited space available
            </span>
          </button>

          <p className="text-sm text-black/60 mb-6">No experience necessary.</p>

          <div className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center mx-auto mb-3">
            <img
              src="/images/fc-white-initials.svg"
              alt="FC"
              className="h-8 brightness-0 invert"
            />
          </div>
          <p className="text-[10px] text-black/40">
            Copyright {new Date().getFullYear()}, FightCraft Martial Arts
          </p>
          <p className="text-[10px] text-black/40">
            {loc.address}, {loc.city}, {loc.state} {loc.zip}
          </p>
        </div>
      </div>
      <BeginnerModal />
    </div>
  );
}
