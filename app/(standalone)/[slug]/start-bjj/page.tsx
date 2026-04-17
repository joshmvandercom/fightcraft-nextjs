"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { getLead, setLead } from "@/lib/lead";
import { setSidCookie } from "@/lib/sid";
import { identify, track } from "@/lib/analytics";
import { metaPixelTrack } from "@/components/MetaPixel";
import { fireFunnelEvent } from "@/lib/funnel";
import AutoPlayVideo from "@/components/AutoPlayVideo";

const LOCATION_DATA: Record<
  string,
  {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    owner: string;
  }
> = {
  "san-jose": {
    name: "San Jose",
    address: "1825 W. San Carlos St.",
    city: "San Jose",
    state: "CA",
    zip: "95128",
    owner: "Josh",
  },
  merced: {
    name: "Merced",
    address: "2844 G St",
    city: "Merced",
    state: "CA",
    zip: "95430",
    owner: "Patrick",
  },
  brevard: {
    name: "Brevard",
    address: "69 West French Broad",
    city: "Brevard",
    state: "NC",
    zip: "28712",
    owner: "Ricky",
  },
};

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CTAButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-lg mx-auto py-4 px-8 bg-white text-black rounded-xl hover:bg-white/90 transition-colors cursor-pointer block"
    >
      <span className="block font-heading text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        Start Jiu-Jitsu for $33
      </span>
      <span className="text-xs text-black/60 uppercase tracking-widest">
        50% off your first 3 months
      </span>
    </button>
  );
}

function StartBJJContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const loc = LOCATION_DATA[slug] || LOCATION_DATA["san-jose"];
  const fromQuiz = searchParams.get("from") === "quiz";

  const [pageLoadTime] = useState(() => Date.now());
  const [modalOpen, setModalOpen] = useState(false);
  const [exitTriggered, setExitTriggered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyFlashed, setStickyFlashed] = useState(false);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    return getLead()?.name || "";
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return getLead()?.phone || "";
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return getLead()?.email || "";
  });
  const firstName = name ? name.split(" ")[0] : "";

  useEffect(() => {
    import("@/lib/lead").then(({ getLeadWithSid, hasSidParam }) => {
      if (!hasSidParam() && name) return;
      getLeadWithSid().then((lead) => {
        if (lead) {
          setName(lead.name);
          setEmail(lead.email);
          setPhone(lead.phone);
        }
      });
    });
  }, []);

  useEffect(() => {
    track("page_view", { location: slug, page: "start-bjj", lead_source: "meta" });
    fireFunnelEvent("offer_viewed", "start-bjj-33");

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitTriggered) {
        setExitTriggered(true);
        if (!sessionStorage.getItem("lead_modal_dismissed")) {
          setModalOpen(true);
        }
      }
    };
    document.addEventListener("mouseout", handler);
    return () => document.removeEventListener("mouseout", handler);
  }, [exitTriggered, slug]);

  useEffect(() => {
    if (!heroCTARef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroCTARef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (stickyVisible && !stickyFlashed) {
      const timer = setTimeout(() => setStickyFlashed(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [stickyVisible, stickyFlashed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !email) return;
    setSubmitting(true);

    const data = {
      name,
      email,
      phone,
      location: slug,
      website: "",
      lead_source: "meta",
      _t: pageLoadTime,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.sid) setSidCookie(json.sid);
        setLead({ name, email, phone, location: slug });
        identify(email, { name, location: slug });
        track("lead_created", {
          location: slug,
          lead_source: "meta",
          offer: "start-bjj-33",
        });
        metaPixelTrack("Lead");

        fireFunnelEvent("checkout_started", "start-bjj-33");
        const checkoutRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            phone,
            location: slug,
            offer: "start-bjj-33",
            cancelPath: `/${slug}/start-bjj`,
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }
    } catch {}
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col bg-black min-h-screen">
      {/* Quiz DQ intro */}
      {fromQuiz && (
        <div className="bg-black text-white py-12 px-6 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-heading text-xs uppercase tracking-widest text-white/40 mb-4">
              One More Thing
            </p>
            <h2 className="font-heading text-2xl md:text-3xl uppercase font-bold tracking-tight mb-4">
              {firstName
                ? <>Hey {firstName}, it looks like the investment{' '}<span className="whitespace-nowrap">isn&apos;t quite a fit right now.</span></>
                : <>Hey, it looks like the investment{' '}<span className="whitespace-nowrap">isn&apos;t quite a fit right now.</span></>}
            </h2>
            <p className="text-white/60 mb-6 max-w-xl mx-auto">
              Sometimes people need to see the value first. We get that. So here&apos;s what we can do:
            </p>
            <div className="inline-block border border-white/20 px-6 py-4 mb-4">
              <p className="font-heading text-lg uppercase tracking-tight font-bold text-white">
                Start Jiu-Jitsu for just <span className="text-red-500">$33/week</span>
              </p>
              <p className="text-sm text-white/50 mt-1">
                That&apos;s 50% off. This is a one-time, online-only offer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero — video background */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden">
        <AutoPlayVideo
          src="/images/home/bjj-hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 px-6 max-w-4xl mx-auto w-full text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/images/fc-white-initials.svg"
              alt="FightCraft"
              className="h-12 brightness-0 invert"
            />
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {firstName ? (
              <>
                <span className="shimmer-once bg-[linear-gradient(90deg,#ef4444_0%,#f97316_40%,#fff_50%,#f97316_60%,#ef4444_100%)] bg-clip-text text-transparent">
                  {firstName}
                </span>
                , ready to start jiu-jitsu?
              </>
            ) : (
              <>
                Start Jiu-Jitsu.
                <br />
                50% Off for 3 Months.
              </>
            )}
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Gi and No-Gi classes. All levels welcome.
            <br />
            Start today for just{" "}
            <span className="text-white font-bold">$33</span>.
          </p>

          <div ref={heroCTARef}>
            <CTAButton onClick={() => setModalOpen(true)} />
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex flex-col items-center gap-2">
              <Stars />
              <p className="text-sm text-white/40">
                Rated <span className="text-white/60 font-bold">4.9</span> from{" "}
                <span className="text-white/60 font-bold">139+ reviews</span> on
                Google
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What you get */}
      <div className="relative py-20 px-6">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center"
          style={{ backgroundImage: "url(/images/home/bjj-callout.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4">
            What $33 Gets You
          </h2>
          <p className="text-white/50 mb-14 max-w-xl">
            Pay $33 today and start training immediately. 50% off continues for
            3 full months.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-heading text-6xl font-bold text-white/30">
                1
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">
                Gi &amp; No-Gi Classes
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Train both styles from day one. Gi builds technique and
                precision. No-Gi develops speed and athleticism. You get both.
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-white/30">
                2
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">
                Expert Coaching
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Our coaches break down every position, sweep, and submission so
                it clicks. You&apos;ll never be thrown in without direction.
              </p>
            </div>

            <div>
              <span className="font-heading text-6xl font-bold text-white/30">
                3
              </span>
              <h3 className="font-heading text-xl uppercase font-bold tracking-tight text-white mb-3 -mt-2">
                True Beginner Friendly
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Never rolled before? Perfect. Most of our members started with
                zero experience. You&apos;ll learn at your own pace with
                training partners who want to help you grow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The deal breakdown */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-black/50 mb-12 max-w-xl">
            Simple. No hidden fees. No surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="border border-black/10 p-6">
              <p className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">
                Today
              </p>
              <p className="font-heading text-3xl font-bold mb-2">$33</p>
              <p className="text-sm text-black/60">
                Your first week. Full access to every jiu-jitsu class on the
                schedule. Start immediately.
              </p>
            </div>
            <div className="border border-black/10 p-6">
              <p className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">
                Months 1-3
              </p>
              <p className="font-heading text-3xl font-bold mb-2">50% Off</p>
              <p className="text-sm text-black/60">
                Continue at half the normal weekly rate. Same unlimited access.
                No change in what you get.
              </p>
            </div>
            <div className="border border-black/10 p-6">
              <p className="font-heading text-sm uppercase tracking-widest text-black/40 mb-2">
                After 3 Months
              </p>
              <p className="font-heading text-3xl font-bold mb-2">
                Standard Rate
              </p>
              <p className="text-sm text-black/60">
                You continue at the regular weekly rate. By then, you won&apos;t
                want to stop.
              </p>
            </div>
          </div>

          <p className="text-xs text-black/40 text-center">
            12-month membership commitment. Cancel policy applies. See staff for
            details.
          </p>
        </div>
      </div>

      {/* What you'll learn */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-6">
                What You&apos;ll Learn
              </h2>
              <p className="text-white/50 mb-8">
                Jiu-Jitsu is chess with your body. Here&apos;s what we cover from week one.
              </p>

              <div className="space-y-4">
                {[
                  "Takedowns & Clinch Work",
                  "Guard Passing",
                  "Sweeps & Reversals",
                  "Submissions",
                  "Escapes & Defense",
                  "Positional Control",
                  "Competition Prep (Optional)",
                ].map((prog) => (
                  <div key={prog} className="flex gap-3 items-center">
                    <svg
                      className="w-5 h-5 text-green-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span className="font-heading text-sm uppercase tracking-widest">
                      {prog}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <img
                src="/images/home/bjj.webp"
                alt="Jiu-Jitsu training at FightCraft"
                className="w-full aspect-[9/16] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coach note */}
      <div className="relative py-20 px-6 overflow-hidden">
        <img
          src="/images/home/bjj-callout.jpg"
          alt="FightCraft jiu-jitsu"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <p className="font-heading text-sm uppercase tracking-widest text-white/40 mb-4">
            From Coach {loc.owner}
          </p>
          <div className="space-y-4 text-lg text-white/70">
            <p>
              {firstName ? `Hey ${firstName}, here` : "Here"}&apos;s the truth
              about jiu-jitsu: your first class will be humbling. You won&apos;t
              know what to do. That&apos;s the point.
            </p>
            <p>
              Jiu-Jitsu teaches you that the person who shows up consistently
              beats the person who waits until they&apos;re ready. There is no
              &ldquo;ready.&rdquo; There&apos;s just day one.
            </p>
            <p>
              $33 for your first week. Half price for 3 months. Gi and No-Gi
              classes. Coaches who actually care about your progress.
            </p>
            <p>
              The hardest part is walking through the door. Everything after that
              gets easier.
            </p>
            <p className="text-white font-bold">
              {firstName ? `${firstName}, we'll` : "We'll"} see you on the mat.
            </p>
          </div>
        </div>
      </div>

      {/* This is for you if */}
      <div className="bg-white text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            This Is For You If
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "You've been curious about jiu-jitsu but didn't know where to start",
              "You want a workout that's mentally and physically challenging",
              "You want to learn real self-defense that works regardless of size or strength",
              "You're looking for a tight-knit community that holds each other accountable",
              "You've watched UFC and thought \"I want to learn how to do that\"",
              "You've trained before and you're ready to get back on the mat",
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-black/70">{item}</p>
              </div>
            ))}
          </div>

          <CTAButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-neutral-100 text-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight text-center mb-12">
            Don&apos;t Take Our Word For It
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: "Sarah B.",
                quote:
                  "As an introvert who works a high stress medical career I value and look forward to my time at FightCraft. It has by now become a lifestyle. I am in the best shape I've ever been.",
              },
              {
                name: "Zach H.",
                quote:
                  "From the moment you walk in the door you know there is something special about this place. The coaches are extremely knowledgeable, very friendly, and passionate about wanting you to learn the craft correctly.",
              },
              {
                name: "Dakota S.",
                quote:
                  "The environment is very laid back and the people are great. I had no prior striking experience before my first class but that was no problem at all. Coach Josh broke everything down so it was easy to pick up quickly.",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white p-6 border border-black/10">
                <Stars />
                <p className="text-sm text-black/60 leading-relaxed mt-3 mb-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="font-heading text-xs uppercase tracking-widest font-bold">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl uppercase font-bold tracking-tight mb-12">
            Common Questions
          </h2>

          <div className="space-y-8 mb-12">
            {[
              {
                q: "What does 50% off for 3 months mean?",
                a: "You pay half the normal weekly rate for your first 3 months of training. Start today for $33 (your first week), then continue at the discounted rate.",
              },
              {
                q: "Do I need experience?",
                a: "None. Most of our jiu-jitsu members started as complete beginners. You'll learn fundamentals from day one.",
              },
              {
                q: "What's the difference between Gi and No-Gi?",
                a: "Gi training uses the traditional uniform (kimono) which adds grips and a more technical game. No-Gi is faster-paced in shorts and a rash guard. We teach both — you'll find your preference.",
              },
              {
                q: "Will I get hurt?",
                a: "Safety is our priority. You'll learn to tap early, roll controlled, and our coaches match you with appropriate training partners. Jiu-Jitsu is one of the safest martial arts to train.",
              },
              {
                q: "What do I need to bring?",
                a: "Athletic clothes for your first class (shorts and a t-shirt work). We have loaner gis available. Bring water and a towel.",
              },
              {
                q: "Is there a commitment?",
                a: "Yes, this is a 12-month membership at our discounted rate. After 3 months, you continue at the standard weekly rate.",
              },
              {
                q: "Can I also take kickboxing and other classes?",
                a: "Yes! Your membership includes every class on the schedule — kickboxing, Muay Thai, MMA, wrestling, and more.",
              },
            ].map((item) => (
              <div key={item.q}>
                <p className="font-bold text-lg mb-2">{item.q}</p>
                <p className="text-white/50">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final push */}
      <div className="relative py-20 px-6 overflow-hidden">
        <AutoPlayVideo
          src="/images/home/bjj-hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl uppercase font-bold tracking-tight text-white mb-4">
            {firstName
              ? `${firstName}, Your First Class Is Waiting.`
              : "Your First Class Is Waiting."}
          </h2>
          <p className="text-white/60 mb-2">
            50% off for 3 months. Start jiu-jitsu today for $33.
          </p>
          <p className="text-white/40 text-sm mb-8">
            12-month membership. Gi &amp; No-Gi. All levels.
          </p>

          <CTAButton onClick={() => setModalOpen(true)} />

          <p className="text-white/20 text-xs mt-8">
            FightCraft {loc.name} &middot; {loc.address}, {loc.city},{" "}
            {loc.state} {loc.zip}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-8 px-6 text-center">
        <div className="w-[50px] h-[50px] bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <img
            src="/images/fc-white-initials.svg"
            alt="FC"
            className="h-6 brightness-0 invert"
          />
        </div>
        <p className="text-[10px] text-white/30">
          Copyright {new Date().getFullYear()}, FightCraft Martial Arts
        </p>
      </div>

      {/* Sticky CTA - slides up when hero CTA scrolls out */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10 px-4 py-4 transition-transform duration-300 ${stickyVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setModalOpen(true)}
            className={`w-full py-4 font-heading text-base uppercase tracking-widest font-bold rounded-lg transition-all duration-700 ${stickyVisible && !stickyFlashed ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
          >
            Start Jiu-Jitsu for $33
          </button>
          <p className={`text-center text-xs text-white/40 mt-2 transition-opacity duration-1000 ${stickyVisible ? 'opacity-100' : 'opacity-0'}`}>50% off for 3 months. Gi &amp; No-Gi included.</p>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setModalOpen(false);
              sessionStorage.setItem("lead_modal_dismissed", "1");
            }}
          />
          <div className="relative w-full max-w-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
                sessionStorage.setItem("lead_modal_dismissed", "1");
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-black text-white text-center py-3">
                <p className="font-heading text-sm uppercase tracking-widest font-bold">
                  Start Jiu-Jitsu for $33
                </p>
              </div>
              <div className="p-8">
                <h2 className="text-xl font-bold mb-2">
                  {firstName ? `Let's go, ${firstName}.` : "Almost there!"}
                </h2>
                <p className="text-sm text-black/50 mb-6">
                  Complete your info and we&apos;ll get you on the mat.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Your Mobile Phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Your Best Email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-black/20 rounded text-sm focus:outline-none focus:border-black/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-black text-white font-heading text-lg font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Start for $33"}
                  </button>
                </form>
                <p className="text-center text-sm text-black/40 mt-4">
                  50% off for 3 months. 12-month membership.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StartBJJPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <StartBJJContent />
    </Suspense>
  );
}
