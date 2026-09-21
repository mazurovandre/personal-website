'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { PortfolioContent } from '../lib/content';

type DialogName = 'about' | 'contacts' | 'cv';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M20 4 10 14M19 13v7H4V5h7" />
    </svg>
  );
}

function Modal({
  id,
  open,
  title,
  onClose,
  children,
  wide = false
}: {
  id: DialogName;
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      className={wide ? 'wide-dialog' : undefined}
      id={id}
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) onClose();
      }}
    >
      <div className="dialog-top od-row">
        <h2 id={`${id}-title`} className="dialog-title od-fill">{title}</h2>
        <button className="close od-fixed" type="button" aria-label={`Close ${title}`} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Portfolio({ content }: { content: PortfolioContent }) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const { site, aboutMarkdown } = content;
  const fullName = `${site.home.firstName} ${site.home.lastName}`;

  return (
    <>
      <main className="portfolio" aria-label={`${fullName} portfolio`}>
        <header className="top">
          <button className="text-link" type="button" aria-haspopup="dialog" onClick={() => setDialog('contacts')}>
            {site.home.contactsLabel}
          </button>
        </header>
        <section className="identity od-stack" aria-labelledby="name">
          <h1 id="name">
            <span>{site.home.firstName}</span>
            <span className="surname">{site.home.lastName}</span>
          </h1>
          <p>{site.home.role}</p>
        </section>
        <footer className="bottom">
          <button className="text-link" type="button" aria-haspopup="dialog" onClick={() => setDialog('about')}>
            {site.home.aboutLabel}
          </button>
          <button className="text-link" type="button" aria-haspopup="dialog" onClick={() => setDialog('cv')}>
            {site.home.cvLabel}
          </button>
        </footer>
      </main>

      <Modal id="about" open={dialog === 'about'} title={site.about.title} onClose={() => setDialog(null)}>
        <div className="dialog-copy od-stack">
          <div className="markdown-copy">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aboutMarkdown}</ReactMarkdown>
          </div>
          <h3 className="stack-title">{site.about.toolkitLabel}</h3>
          <ul className="tech-list od-cluster">
            {site.about.technologies.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
          {site.about.stackNote && <p className="detail-note">{site.about.stackNote}</p>}
        </div>
      </Modal>

      <Modal id="contacts" open={dialog === 'contacts'} title={site.contacts.title} onClose={() => setDialog(null)}>
        <div className="dialog-copy od-stack">
          <a className="contact-address" href={`mailto:${site.contacts.email}`}>{site.contacts.email}</a>
          <nav className="social-links od-cluster" aria-label="Social profiles">
            {site.contacts.links.map(({ label, url }) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>
                {label}<ExternalIcon />
              </a>
            ))}
          </nav>
        </div>
      </Modal>

      <Modal id="cv" open={dialog === 'cv'} title={site.cv.title} onClose={() => setDialog(null)} wide>
        <div className="dialog-copy od-stack">
          <object className="pdf-view" data="/cv/cv.pdf#view=FitH" type="application/pdf" aria-label={`${fullName} CV`}>
            <p>{site.cv.fallback} <a href="/cv/cv.pdf" target="_blank" rel="noopener">{site.cv.openLabel}</a>.</p>
          </object>
          <div className="cv-actions od-cluster">
            <a className="primary-action" href="/cv/download">{site.cv.downloadLabel}</a>
            <a href="/cv/cv.pdf" target="_blank" rel="noopener">{site.cv.openLabel}</a>
          </div>
        </div>
      </Modal>
    </>
  );
}
