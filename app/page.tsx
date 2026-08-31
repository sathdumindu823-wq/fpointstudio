"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  defaultHomepageContent,
  type HomepageContent,
} from "@/lib/homepage-content";
import {
  defaultPortfolioCategoryCoverImages,
} from "@/lib/portfolio-categories";

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [categoryCoverImages, setCategoryCoverImages] = useState<Record<string, string>>(
    defaultPortfolioCategoryCoverImages
  );

  useEffect(() => {
    async function loadHomepageData() {
      const [{ data: homepageData }, { data: categoryRows }] = await Promise.all([
        supabase
          .from("homepage_content")
          .select("content")
          .eq("id", 1)
          .maybeSingle(),
        supabase
          .from("portfolio_categories")
          .select("slug, image_url"),
      ]);

      if (homepageData?.content && typeof homepageData.content === "object") {
        setContent({
          ...defaultHomepageContent,
          ...(homepageData.content as Partial<HomepageContent>),
        });
      }

      const savedCategoryCovers = (categoryRows ?? []).reduce<Record<string, string>>(
        (result, item) => {
          if (item.slug && item.image_url) {
            result[item.slug] = item.image_url;
          }
          return result;
        },
        {}
      );

      setCategoryCoverImages({
        ...defaultPortfolioCategoryCoverImages,
        ...savedCategoryCovers,
      });
    }

    loadHomepageData();
  }, [supabase]);

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0a0908;
          color: #f5f1eb;
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        img {
          max-width: 100%;
          display: block;
        }

        nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6%;
          background: rgba(10, 9, 8, 0.78);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1000;
        }

        .nav-logo {
          width: 90px;
          height: auto;
        }

        .nav-links {
          display: flex;
          gap: 35px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: #d6d0c8;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: 0.3s;
        }

        .nav-links a:hover {
          color: #c69b65;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 20px 80px;
          background:
            linear-gradient(
              rgba(0, 0, 0, 0.48),
              rgba(0, 0, 0, 0.82)
            ),
            url("https://images.unsplash.com/photo-1516035069371-29a1b244cc32")
              center / cover no-repeat;
        }

        .hero-content {
          max-width: 900px;
        }

        .hero-logo {
          width: 300px;
          max-width: 75vw;
          margin: 0 auto 30px;
        }

        .eyebrow {
          color: #c69b65;
          font-size: 12px;
          letter-spacing: 5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero h1 {
          font-size: clamp(42px, 7vw, 90px);
          font-weight: 300;
          letter-spacing: 8px;
          line-height: 1.1;
          text-transform: uppercase;
          margin: 0;
        }

        .hero p {
          max-width: 650px;
          margin: 25px auto 0;
          color: #cfc8bf;
          font-size: 17px;
          letter-spacing: 1px;
        }

        .hero-buttons {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 15px 30px;
          border: 1px solid #c69b65;
          border-radius: 3px;
          color: #f5f1eb;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: 0.3s;
        }

        .btn:hover {
          background: #c69b65;
          color: #080706;
        }

        .btn-filled {
          background: #c69b65;
          color: #080706;
        }

        section {
          padding: 110px 8%;
        }

        .section-heading {
          max-width: 750px;
          margin-bottom: 55px;
        }

        .section-heading span {
          color: #c69b65;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .section-heading h2 {
          margin-top: 15px;
          font-size: clamp(35px, 5vw, 60px);
          font-weight: 300;
          letter-spacing: 2px;
          margin-bottom: 0;
        }

        .section-heading p {
          margin-top: 20px;
          color: #a9a39c;
          font-size: 16px;
        }

        .services {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .service-card {
          min-height: 280px;
          padding: 40px 30px;
          background: #12100e;
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: 0.35s;
        }

        .service-card:hover {
          transform: translateY(-8px);
          border-color: rgba(198, 155, 101, 0.5);
        }

        .service-number {
          color: #c69b65;
          font-size: 12px;
          letter-spacing: 3px;
        }

        .service-card h3 {
          margin-top: 30px;
          font-size: 25px;
          font-weight: 400;
        }

        .service-card p {
          margin-top: 15px;
          color: #99938c;
        }

        .portfolio {
          background: #0d0c0b;
        }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .portfolio-item {
          min-height: 350px;
          position: relative;
          overflow: hidden;
          background: #171513;
        }

        .portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.6s;
        }

        .portfolio-item:hover img {
          transform: scale(1.06);
        }

        .portfolio-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 25px;
          background: linear-gradient(
            transparent,
            rgba(0, 0, 0, 0.85)
          );
        }

        .portfolio-overlay h3 {
          font-weight: 400;
          font-size: 20px;
          margin: 0;
        }

        .portfolio-overlay p {
          color: #c69b65;
          font-size: 12px;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .about {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }

        .about-image {
          min-height: 550px;
          background:
            linear-gradient(
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.4)
            ),
            url("https://images.unsplash.com/photo-1542038784456-1ea8e935640e")
              center / cover no-repeat;
        }

        .about-text h2 {
          font-size: clamp(35px, 5vw, 60px);
          font-weight: 300;
        }

        .about-text p {
          margin-top: 25px;
          color: #aaa39b;
        }

        .cta {
          text-align: center;
          background:
            linear-gradient(
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0.8)
            ),
            url("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4")
              center / cover no-repeat;
        }

        .cta .section-heading {
          margin-left: auto;
          margin-right: auto;
        }

        .cta h2 {
          font-size: clamp(40px, 6vw, 75px);
          font-weight: 300;
        }

        .cta p {
          max-width: 600px;
          margin: 20px auto 35px;
          color: #ccc;
        }

        footer {
          padding: 60px 8% 30px;
          background: #050504;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }

        .footer-logo {
          width: 130px;
        }

        .footer-text {
          color: #777;
          font-size: 13px;
        }

        .copyright {
          margin-top: 40px;
          color: #555;
          font-size: 11px;
          letter-spacing: 1px;
          text-align: center;
        }

        @media (max-width: 800px) {
          nav {
            height: 70px;
            padding: 0 5%;
          }

          .nav-links {
            display: none;
          }

          .hero {
            min-height: 100svh;
          }

          .hero-logo {
            width: 220px;
          }

          .hero h1 {
            letter-spacing: 4px;
          }

          section {
            padding: 80px 6%;
          }

          .services {
            grid-template-columns: 1fr;
          }

          .portfolio-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-item {
            min-height: 420px;
          }

          .about {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-image {
            min-height: 400px;
          }

          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <Link href="#home">
          <Image
            src="/logo.png"
            alt="F Point Studio"
            width={90}
            height={50}
            className="nav-logo"
          />
        </Link>

        <ul className="nav-links">
          <li>
            <Link href="#home">Home</Link>
          </li>

          <li>
            <Link href="#services">Services</Link>
          </li>

          <li>
            <Link href="/portfolio">Portfolio</Link>
          </li>

          <li>
            <Link href="#about">About</Link>
          </li>

          <li>
            <Link href="#contact">Contact</Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section
        className="hero"
        id="home"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.82)), url("${content.heroImageUrl}")`,
        }}
      >
        <div className="hero-content">
          <Image
            src="/logo.png"
            alt="F Point Studio Logo"
            width={300}
            height={160}
            priority
            className="hero-logo"
          />

          <div className="eyebrow">
            {content.heroEyebrow}
          </div>

          <h1>
            <MultilineText value={content.heroTitle} />
          </h1>

          <p>
            {content.heroDescription}
          </p>

          <div className="hero-buttons">
            <Link
              href="/portfolio"
              className="btn btn-filled"
            >
              View Portfolio
            </Link>

            <Link
              href="#contact"
              className="btn"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-heading">
          <span>{content.servicesEyebrow}</span>

          <h2>
            <MultilineText value={content.servicesTitle} />
          </h2>

          <p>
            {content.servicesDescription}
          </p>
        </div>

        <div className="services">
          <div className="service-card">
            <div className="service-number">01</div>

            <h3>Photography</h3>

            <p>
              Weddings, portraits, events,
              fashion and commercial photography
              captured with a cinematic approach.
            </p>
          </div>

          <div className="service-card">
            <div className="service-number">02</div>

            <h3>Videography</h3>

            <p>
              Cinematic films, promotional videos,
              events and social media content
              crafted around your story.
            </p>
          </div>

          <div className="service-card">
            <div className="service-number">03</div>

            <h3>Aerial</h3>

            <p>
              Professional drone photography
              and cinematic aerial videography
              for productions and businesses.
            </p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section
        className="portfolio"
        id="portfolio"
      >
        <div className="section-heading">
          <span>Selected Work</span>

          <h2>Our Portfolio</h2>

          <p>
            A selection of our recent visual work.
            Explore our complete portfolio.
          </p>
        </div>

        <div className="portfolio-grid">

          {/* WEDDINGS */}
          <Link
            href="/portfolio/wedding"
            className="portfolio-item"
          >
            <img
              src={categoryCoverImages.wedding || defaultPortfolioCategoryCoverImages.wedding}
              alt="Wedding photography"
            />

            <div className="portfolio-overlay">
              <h3>Weddings</h3>
              <p>PHOTOGRAPHY</p>
            </div>
          </Link>

          {/* PORTRAITS */}
          <Link
            href="/portfolio/portraits"
            className="portfolio-item"
          >
            <img
              src={categoryCoverImages.portraits || defaultPortfolioCategoryCoverImages.portraits}
              alt="Portrait photography"
            />

            <div className="portfolio-overlay">
              <h3>Portraits</h3>
              <p>PHOTOGRAPHY</p>
            </div>
          </Link>

          {/* FULL PORTFOLIO */}
          <Link
            href="/portfolio"
            className="portfolio-item"
          >
            <img
              src={categoryCoverImages.events || defaultPortfolioCategoryCoverImages.events}
              alt="F Point Studio portfolio"
            />

            <div className="portfolio-overlay">
              <h3>View All Work</h3>
              <p>F POINT STUDIO</p>
            </div>
          </Link>

        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="about">
          <div
            className="about-image"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.4)), url("${content.aboutImageUrl}")`,
            }}
          />

          <div className="about-text">
            <div className="section-heading">
              <span>{content.aboutEyebrow}</span>

              <h2>
                <MultilineText value={content.aboutTitle} />
              </h2>
            </div>

            <p>
              {content.aboutParagraphOne}
            </p>

            <p>
              {content.aboutParagraphTwo}
            </p>

            <br />

            <a
              href="#contact"
              className="btn"
            >
              Work With Us
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        className="cta"
        id="contact"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.8)), url("${content.contactImageUrl}")`,
        }}
      >
        <div className="section-heading">
          <span>{content.contactEyebrow}</span>

          <h2>
            <MultilineText value={content.contactTitle} />
          </h2>

          <p>
            {content.contactDescription}
          </p>

          <a
              href={`mailto:${content.contactEmail}`}
            className="btn btn-filled"
          >
            Contact F Point Studio
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <Image
            src="/logo.png"
            alt="F Point Studio"
            width={130}
            height={70}
            className="footer-logo"
          />

          <div className="footer-text">
            Photography · Videography · Aerial
          </div>
        </div>

        <div className="copyright">
          © 2026 F Point Studio. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}

function MultilineText({ value }: { value: string }) {
  return value.split("\n").map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </Fragment>
 ));
}
