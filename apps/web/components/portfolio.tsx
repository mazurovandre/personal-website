'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
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

function ContactForm({ content }: { content: PortfolioContent['site']['contacts'] }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus('sending');
    setMessage('');

    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(payload.message ?? 'The message could not be sent. Please try again.');
      }
      form.reset();
      setStatus('success');
      setMessage(content.form.successMessage);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'The message could not be sent.');
    }
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate={false}>
      <h3>{content.form.title}</h3>
      <div className="form-grid">
        <label className="od-field">
          <span>{content.form.nameLabel}</span>
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label className="od-field">
          <span>{content.form.emailLabel}</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label className="od-field">
          <span>{content.form.companyLabel}</span>
          <input name="company" maxLength={150} autoComplete="organization" />
        </label>
        <label className="od-field">
          <span>{content.form.subjectLabel}</span>
          <input name="subject" required maxLength={150} />
        </label>
        <label className="od-field full-field">
          <span>{content.form.messageLabel}</span>
          <textarea name="message" required maxLength={5000} />
        </label>
      </div>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-actions">
        <button className="primary-action" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : content.form.submitLabel}
        </button>
        <p className="privacy-note">
          {content.form.privacyLabel} <Link href="/privacy">Privacy policy</Link>.
        </p>
      </div>
      <p className={status === 'error' ? 'form-status error' : 'form-status'} role="status" hidden={!message}>
        {message}
      </p>
    </form>
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
          <ContactForm content={site.contacts} />
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

