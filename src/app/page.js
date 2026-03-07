"use client";

import Link from "next/link";
import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-6");
            entry.target.classList.add("opacity-100", "translate-y-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".scroll-anim");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-black">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-border sticky top-0 z-50 px-6 lg:px-12 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-moss rounded-md flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px]"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="font-serif text-lg font-semibold tracking-wide text-black">
            Edu<span className="text-moss">Assist</span>
          </div>
        </div>
        <ul className="hidden md:flex gap-10 list-none">
          <li>
            <a
              href="#tools"
              className="text-sm text-gray hover:text-moss transition-colors font-medium"
            >
              Tools
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className="text-sm text-gray hover:text-moss transition-colors font-medium"
            >
              How it Works
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              className="text-sm text-gray hover:text-moss transition-colors font-medium"
            >
              Testimonials
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="text-sm text-gray hover:text-moss transition-colors font-medium"
            >
              Pricing
            </a>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-charcoal hover:text-moss transition-colors font-semibold px-2 py-1"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-moss text-white px-5 py-2 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO */}
        <section className="bg-white border-b border-gray-border py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-moss-pale text-moss text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-moss before:rounded-full">
                Special Education Technology
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight text-black mb-5">
                Smarter Tools for Special Education Teams
              </h1>
              <p className="text-lg text-gray leading-relaxed mb-8 max-w-lg">
                Translate SEIS documents, evaluate psychoeducational reports,
                and ensure IEP compliance — all in one platform built for
                California school districts.
              </p>
              <div className="flex gap-4 items-center">
                <Link
                  href="/register"
                  className="bg-moss text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-moss-light transition-colors shadow-md hover:shadow-lg"
                >
                  Start Free Trial
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-transparent text-charcoal border-2 border-gray-border px-6 py-2.5 rounded-md font-semibold text-sm hover:border-moss hover:text-moss transition-colors"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div
              className="bg-beige border border-gray-border rounded-xl overflow-hidden shadow-2xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-white border-b border-gray-border px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <span className="ml-3 text-xs text-gray-light font-medium">
                  EduAssist — Document Queue
                </span>
              </div>
              <div className="p-6">
                {[
                  {
                    name: "Martinez_IEP_2025.pdf",
                    sub: "Spanish Translation · 14 pages",
                    status: "Translated",
                    statusClass: "bg-moss-pale text-moss",
                    delay: "0.4s",
                  },
                  {
                    name: "Garcia_Psychoed_Report.pdf",
                    sub: "QA Review · 28 pages",
                    status: "In Review",
                    statusClass: "bg-yellow-100 text-yellow-800",
                    delay: "0.55s",
                  },
                  {
                    name: "Kim_Triennial_Eval.pdf",
                    sub: "Compliance Check · 9 pages",
                    status: "Flagged",
                    statusClass: "bg-red-100 text-red-800",
                    delay: "0.7s",
                  },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-border rounded-lg p-3.5 mb-3 flex items-center justify-between gap-4 animate-fade-slide shadow-sm"
                    style={{ animationDelay: doc.delay }}
                  >
                    <div className="w-9 h-9 shrink-0 bg-moss-pale rounded-md flex items-center justify-center">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4e6340"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-black mb-0.5">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-light">{doc.sub}</div>
                    </div>
                    <div
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${doc.statusClass}`}
                    >
                      {doc.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border-t border-gray-border px-4 py-3 text-xs text-gray-light flex items-center justify-between">
                <span>3 of 14 complete</span>
                <div className="h-1.5 bg-gray-border rounded-full flex-1 mx-4 overflow-hidden">
                  <div className="h-full bg-moss rounded-full w-0 animate-grow"></div>
                </div>
                <span>72%</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED BY */}
        <section className="bg-beige border-b border-gray-border py-8 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.15em] text-gray-light mb-6 font-semibold scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
            Trusted by educators across California
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-100">
            <div className="font-serif italic text-sm text-gray font-medium">
              Bellflower Unified
            </div>
            <div className="font-serif italic text-sm text-gray font-medium">
              Los Angeles SELPA
            </div>
            <div className="font-serif italic text-sm text-gray font-medium">
              Riverside County
            </div>
            <div className="font-serif italic text-sm text-gray font-medium">
              San Diego USD
            </div>
            <div className="font-serif italic text-sm text-gray font-medium">
              Fresno SELPA
            </div>
          </div>
        </section>

        {/* TOOLS */}
        <section id="tools" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-[0.15em] text-moss mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
            Our Platform
          </div>
          <h2 className="font-serif text-3xl font-semibold text-black mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-75">
            Everything your team needs
          </h2>
          <p className="text-base text-gray max-w-2xl leading-relaxed mb-12 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-150">
            Purpose-built for school psychologists, special education directors, and district compliance teams serving students with disabilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "SEIS Document Translator",
                desc: "Accurately translate IEPs, assessment reports, and prior written notices into Spanish, Tagalog, Vietnamese, and 10+ more languages — preserving legal formatting.",
                link: "Learn more",
              },
              {
                title: "Psychoed Report QA",
                desc: "Automatically evaluate psychoeducational reports for compliance with IDEA, state eligibility criteria, and district standards — with line-by-line feedback.",
                link: "Learn more",
              },
              {
                title: "IEP Compliance Tracker",
                desc: "Monitor timelines, track procedural safeguards, and generate compliance reports across your entire caseload or district portfolio in real time.",
                link: "Learn more",
              },
            ].map((tool, i) => (
              <div
                key={i}
                className="bg-white border border-gray-border rounded-xl p-8 hover:shadow-xl hover:border-moss-pale transition-all duration-300 cursor-pointer group scroll-anim opacity-0 translate-y-6 ease-out"
                style={{ transitionDuration: "700ms", transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-moss-pale rounded-xl flex items-center justify-center mb-6 text-moss group-hover:scale-110 transition-transform">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    {i === 0 && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                      </>
                    )}
                    {i === 1 && (
                      <>
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </>
                    )}
                    {i === 2 && (
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-black mb-3">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray leading-relaxed mb-6">
                  {tool.desc}
                </p>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss group-hover:gap-2.5 transition-all">
                  {tool.link} <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="bg-charcoal py-24 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-moss-pale mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
              How It Works
            </div>
            <h2 className="font-serif text-3xl font-semibold text-white mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-75">
              From upload to done in minutes
            </h2>
            <p className="text-base text-gray-light max-w-2xl leading-relaxed mb-12 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-150">
              No training required. Upload your document and let EduAssist do the rest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-200">
              {[
                {
                  num: "01",
                  pill: "Upload",
                  title: "Add Your Document",
                  desc: "Drag and drop any SEIS-generated PDF, Word doc, or assessment report directly into the platform.",
                },
                {
                  num: "02",
                  pill: "Select",
                  title: "Choose Your Tool",
                  desc: "Select translation, QA review, compliance check, or run all three simultaneously on a single document.",
                },
                {
                  num: "03",
                  pill: "Review",
                  title: "Get Instant Results",
                  desc: "Receive a formatted output with highlighted flags, translation notes, and a compliance score within seconds.",
                },
                {
                  num: "04",
                  pill: "Export",
                  title: "Download & Share",
                  desc: "Export professional-grade documents ready to share with families, legal teams, or district administration.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-charcoal p-8 relative"
                >
                  <div className="font-serif text-5xl text-moss/30 mb-6 leading-none">
                    {step.num}
                  </div>
                  <div className="inline-block bg-moss text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                    {step.pill}
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2.5">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
             <div className="text-xs font-bold uppercase tracking-[0.15em] text-moss mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
               From Educators
             </div>
             <h2 className="font-serif text-3xl font-semibold text-black mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-75">
               Trusted by those who know SPED
             </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-border rounded-xl p-8 shadow-sm scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-100">
              <div className="flex gap-1 mb-4 text-moss">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <blockquote className="font-serif text-lg italic text-charcoal leading-relaxed mb-6">
                "This eliminated hours of manual translation work. Our Spanish-speaking families finally receive documents they can fully understand — and we meet our timelines."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-pale flex items-center justify-center font-serif text-moss font-bold text-sm">
                  MR
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">Maria R.</div>
                  <div className="text-xs text-gray">Director of Special Education, Riverside USD</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-border rounded-xl p-8 shadow-sm scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-200">
              <div className="flex gap-1 mb-4 text-moss">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <blockquote className="font-serif text-lg italic text-charcoal leading-relaxed mb-6">
                "The QA tool catches eligibility errors I might miss after a long day. It's like having a compliance officer review every report before I submit."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-pale flex items-center justify-center font-serif text-moss font-bold text-sm">
                  DK
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">Dr. David K.</div>
                  <div className="text-xs text-gray">School Psychologist, LAUSD</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="bg-beige border-t border-gray-border py-24 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-moss mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
                Pricing
              </div>
              <h2 className="font-serif text-3xl font-semibold text-black mb-3 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-75">
                Plans for every team size
              </h2>
              <p className="text-base text-gray max-w-xl mx-auto scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-150">
                All plans include a 30-day free trial. No credit card required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-white border border-gray-border rounded-xl p-8 relative flex flex-col hover:shadow-lg transition-shadow scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-100">
                <div className="text-xs font-bold tracking-widest uppercase text-gray mb-3">Starter</div>
                <div className="font-serif text-4xl font-semibold text-black mb-1">
                  <span className="text-xl align-top block mt-2 -mb-2">$</span>49<span className="text-sm text-gray font-sans font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray mb-6 leading-relaxed">For individual school psychologists managing their own caseload.</p>
                <div className="h-px bg-gray-border w-full mb-6"></div>
                <ul className="flex-1 flex flex-col gap-3 mb-8">
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Up to 25 documents/month</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Spanish translation</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Basic QA checklist</li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-light"><span className="text-gray-light">–</span> Multi-language support</li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-light"><span className="text-gray-light">–</span> District dashboard</li>
                </ul>
                <Link href="/register" className="w-full py-3 rounded-md font-semibold text-sm border-2 border-gray-border text-charcoal hover:border-moss hover:text-moss text-center transition-colors">
                  Start Free Trial
                </Link>
              </div>

              {/* District */}
              <div className="bg-white border-2 border-moss rounded-xl p-8 relative flex flex-col shadow-xl transform md:-translate-y-4 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-200">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-moss text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <div className="text-xs font-bold tracking-widest uppercase text-moss mb-3">District</div>
                <div className="font-serif text-4xl font-semibold text-black mb-1">
                  <span className="text-xl align-top block mt-2 -mb-2">$</span>199<span className="text-sm text-gray font-sans font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray mb-6 leading-relaxed">For special education departments and multi-site school teams.</p>
                <div className="h-px bg-gray-border w-full mb-6"></div>
                <ul className="flex-1 flex flex-col gap-3 mb-8">
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Unlimited documents</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> 13 languages supported</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Full QA compliance review</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Team collaboration tools</li>
                  <li className="flex items-start gap-2.5 text-sm text-gray-light"><span className="text-gray-light">–</span> SELPA network access</li>
                </ul>
                <Link href="/register" className="w-full py-3 rounded-md font-semibold text-sm bg-moss text-white hover:bg-moss-light text-center transition-colors">
                  Start Free Trial
                </Link>
              </div>

              {/* SELPA */}
              <div className="bg-white border border-gray-border rounded-xl p-8 relative flex flex-col hover:shadow-lg transition-shadow scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-300">
                <div className="text-xs font-bold tracking-widest uppercase text-gray mb-3">SELPA</div>
                <div className="font-serif text-4xl font-semibold text-black mb-1">
                  <span className="text-xl align-top block mt-2 -mb-2">$</span>799<span className="text-sm text-gray font-sans font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray mb-6 leading-relaxed">For SELPAs and county offices serving multiple school districts.</p>
                <div className="h-px bg-gray-border w-full mb-6"></div>
                <ul className="flex-1 flex flex-col gap-3 mb-8">
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Unlimited everything</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> All 20+ languages</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Advanced compliance reporting</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> District-wide analytics</li>
                  <li className="flex items-start gap-2.5 text-sm text-charcoal"><span className="text-moss font-bold">✓</span> Dedicated account manager</li>
                </ul>
                <Link href="/contact" className="w-full py-3 rounded-md font-semibold text-sm border-2 border-gray-border text-charcoal hover:border-moss hover:text-moss text-center transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-moss py-20 px-6 text-center">
          <h2 className="font-serif text-3xl font-semibold text-white mb-4 scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out">
            Ready to simplify your special education workflow?
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-xl mx-auto scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-100">
            Join hundreds of California educators saving time and improving compliance outcomes.
          </p>
          <div className="scroll-anim opacity-0 translate-y-6 transition-all duration-700 ease-out delay-200">
            <Link href="/register" className="inline-block bg-white text-moss px-8 py-3.5 rounded-md font-bold hover:bg-beige-warm transition-colors shadow-lg">
              Get Started — It's Free
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black py-12 px-6 lg:px-12 border-t border-charcoal">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-xl font-semibold text-beige">
            Edu<span className="text-moss-light">Assist</span>
          </div>
          
          <nav>
            <ul className="flex flex-wrap justify-center gap-6 list-none">
              <li><a href="#" className="text-sm text-gray hover:text-moss-light transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-moss-light transition-colors">Terms</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-moss-light transition-colors">Accessibility</a></li>
              <li><a href="#" className="text-sm text-gray hover:text-moss-light transition-colors">Support</a></li>
            </ul>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-charcoal/50 text-center text-sm text-gray">
          © 2026 EduAssist · Built for California SPED Teams
        </div>
      </footer>
    </div>
  );
}
