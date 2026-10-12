'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import RollText from '@/components/contact/RollText';
import { sendContactMessage } from '@/lib/sendContact';
import { contactEmail, resumeUrl, socialLinks } from '@/lib/data';

// The contact form, written as one sentence with blanks to fill in:
//   "Hi Alaa, I'm [your name]. You can reach me at [your email]. I'm writing about [a full-time role ▾],
//    and here's the role: [message]"
// Every blank is a real <input>, <button> or <textarea> (so keyboards, screen readers and autofill work), styled
// to look like an underlined gap in the text. The same component is used by every entry point (footer card,
// header pill, menu); the card around it lives in ContactPanel.tsx.

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

// The three topics. Picking one also rewrites the words after it and the message's placeholder
const TOPICS = [
  { label: 'a full-time role', phrase: 'and here’s the role:', placeholder: 'the team, the role, a link to the posting' },
  { label: 'a new project', phrase: 'and here’s the project:', placeholder: 'what you’re building and roughly when' },
  { label: 'just saying hi', phrase: 'and here’s what’s on my mind:', placeholder: 'anything at all' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The intro ("ink fill"): the whole sentence shows at 12% opacity, then each word (and each blank) brightens to
// full, left to right, 30ms after the one before, taking 0.35s each. The bottom row fades up last
const INK_START = 0.12;
const INK_STAGGER = 0.03;
const INK_DURATION = 0.35;
const BOTTOM_ROW_AT = 1.0; // seconds after the intro starts

type BlankState = 'empty' | 'valid' | 'invalid';

export default function ContactSentence({
  introDelay,
  reduced,
  hidden,
  onStatusChange,
}: {
  introDelay: number; // seconds before the intro starts (the card is still growing until then)
  reduced: boolean; // prefers-reduced-motion: everything shows in its final state at once
  hidden: boolean; // the card is closing: fade out
  onStatusChange: (status: ContactStatus) => void;
}) {
  // ---- What's typed ----
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topicIndex, setTopicIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [botcheck, setBotcheck] = useState(''); // the honeypot (hidden field; see lib/sendContact.ts)

  // ---- Form state ----
  const [attempted, setAttempted] = useState(false); // has Send been pressed? (only then are mistakes shown)
  const [status, setStatus] = useState<ContactStatus>('idle');
  const [phraseRolls, setPhraseRolls] = useState(false); // true once a topic is picked: its phrase rises in
  const [copied, setCopied] = useState(false);

  useEffect(() => onStatusChange(status), [status, onStatusChange]);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const topicButtonRef = useRef<HTMLButtonElement>(null);

  // ---- Validity of each blank ----
  const nameOk = name.trim().length >= 2;
  const emailOk = EMAIL_PATTERN.test(email.trim());
  const messageOk = message.trim().length >= 2;
  // Lime as soon as a blank is right; "invalid" (dashed) only after a send attempt
  const stateOf = (ok: boolean): BlankState => (ok ? 'valid' : attempted ? 'invalid' : 'empty');

  // The hint next to Send, written like Alaa talking. Only the first problem, in reading order
  const hint = !attempted
    ? null
    : !nameOk
      ? 'Almost. I still need your name.'
      : !emailOk
        ? 'Almost. That email looks a little off.'
        : !messageOk
          ? 'Almost. Add a line or two about it.'
          : null;

  // ---- The Send button shakes once when something's missing. useAnimate: run an animation on demand ----
  const [sendScope, animateSend] = useAnimate();

  async function submit() {
    if (status === 'sending' || status === 'sent') return;
    setAttempted(true);
    if (!nameOk || !emailOk || !messageOk) {
      if (!reduced) animateSend(sendScope.current, { x: [0, -9, 9, -6, 6, -3, 0] }, { duration: 0.45 });
      // Take the visitor straight to the first blank that needs them
      (!nameOk ? nameRef : !emailOk ? emailRef : messageRef).current?.focus();
      return;
    }
    setStatus('sending');
    const { ok } = await sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      topic: TOPICS[topicIndex].label,
      message: message.trim(),
      botcheck,
    });
    setStatus(ok ? 'sent' : 'error');
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: the address is on screen anyway
    }
  }

  // ---- Once the intro has played, put the cursor in the name blank ----
  useEffect(() => {
    const timer = window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), (introDelay + 1.15) * 1000);
    return () => window.clearTimeout(timer);
  }, [introDelay]);

  // ---- Topic menu ----
  const [menuOpen, setMenuOpen] = useState(false);

  // ---- Ink fill: hands out the words' places in the wave, in reading order ----
  let inkIndex = 0;
  const ink = (children: ReactNode, key?: string) => (
    <Ink key={key} i={inkIndex++} start={introDelay} reduced={reduced}>
      {children}
    </Ink>
  );
  // Plain words: each one is its own ink step; the spaces between them stay plain text so lines wrap normally
  const words = (text: string) =>
    text.split(' ').map((word, i, all) => (
      <span key={`${word}-${i}`}>
        {ink(word)}
        {i < all.length - 1 ? ' ' : ''}
      </span>
    ));

  const topic = TOPICS[topicIndex];
  const firstName = name.trim().split(/\s+/)[0];

  // After sending, the thank-you replaces the sentence. AnimatePresence mode="wait": the sentence fades out
  // first (its exit), then the thank-you comes in. (No initial={false} here: it would also switch off the intro's
  // starting state for every word inside)
  return (
    <AnimatePresence mode="wait">
      {status === 'sent' ? (
        <ThankYou key="thanks" firstName={firstName} email={email.trim()} reduced={reduced} />
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.25 } }}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          // The sentence shows (at 12%) when the intro starts, and fades out quickly when the card closes
          initial={{ opacity: 0 }}
          animate={{ opacity: hidden ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : hidden ? 0.2 : 0.1, delay: hidden || reduced ? 0 : introDelay }}
          className="font-body font-medium text-[length:clamp(21px,2.9vw,40px)] leading-[1.6] text-[var(--paper-soft)]"
        >
          {/* Honeypot: off-screen and skipped by keyboards and screen readers; only bots fill it in */}
          <input
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={botcheck}
            onChange={(e) => setBotcheck(e.target.value)}
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />

          <p className="m-0">
            {words('Hi Alaa, I’m')}{' '}
            {/* A blank and the punctuation after it are glued together (whitespace-nowrap), so a line never starts
                with ". You" */}
            {ink(
              <span className="whitespace-nowrap">
                <TextBlank
                  inputRef={nameRef}
                  label="Your name"
                  placeholder="your name"
                  autoComplete="name"
                  value={name}
                  onChange={setName}
                  state={stateOf(nameOk)}
                  onEnter={() => emailRef.current?.focus()}
                />
                .
              </span>
            )}{' '}
            {words('You can reach me at')}{' '}
            {ink(
              <span className="whitespace-nowrap">
                <TextBlank
                  inputRef={emailRef}
                  label="Your email"
                  placeholder="your email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={setEmail}
                  state={stateOf(emailOk)}
                  // Enter in the email blank opens the topic menu, the next blank
                  onEnter={() => setMenuOpen(true)}
                />
                .
              </span>
            )}{' '}
            {words('I’m writing about')}{' '}
            {ink(
              <span className="whitespace-nowrap">
                <TopicBlank
                  buttonRef={topicButtonRef}
                  index={topicIndex}
                  open={menuOpen}
                  setOpen={setMenuOpen}
                  reduced={reduced}
                  onPick={(i) => {
                    if (i !== topicIndex) setPhraseRolls(true);
                    setTopicIndex(i);
                  }}
                />
                ,
              </span>
            )}{' '}
            {/* The words after the topic. When the topic changes they're replaced (key={topicIndex}) and each word
                rises into place, 35ms after the one before, in time with the topic's roll */}
            <span key={topicIndex}>
              {phraseRolls
                ? topic.phrase.split(' ').map((word, i, all) => (
                    <span key={i}>
                      <motion.span
                        className="inline-block"
                        initial={reduced ? false : { y: '0.6em', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {word}
                      </motion.span>
                      {i < all.length - 1 ? ' ' : ''}
                    </span>
                  ))
                : words(topic.phrase)}
            </span>
          </p>

          {ink(
            <MessageBlank
              textareaRef={messageRef}
              placeholder={topic.placeholder}
              value={message}
              onChange={setMessage}
              state={stateOf(messageOk)}
              onSubmitShortcut={submit}
            />,
            'message'
          )}

          {/* ---- Bottom row: the sign-off on the left, the hint and Send on the right. Fades up last ---- */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduced ? 0 : introDelay + BOTTOM_ROW_AT, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 md:mt-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              {/* Signed with the name as it's typed; "…" until then */}
              <p className="m-0 font-heading italic text-[length:clamp(20px,1.9vw,28px)] leading-tight text-[var(--paper-soft)]">
                Talk soon, <span className="text-[var(--paper-full)]">{firstName || '…'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3 ml-auto">
                {/* What's missing or what went wrong, in words (never colour alone). aria-live: read out when it changes.
                    Elms Sans italic: Cormorant Unicase would draw a whole sentence in mixed small capitals */}
                <p role="status" aria-live="polite" className="m-0 max-w-[30ch] text-right font-body italic text-[length:clamp(15px,1.15vw,18px)] leading-snug text-[var(--paper-full)]">
                  {status === 'error' ? (
                    <>
                      Something went wrong. You can email me at {contactEmail} instead.{' '}
                      <button type="button" onClick={copyEmail} className="font-body not-italic text-[0.8em] underline underline-offset-4 decoration-[var(--lime)]">
                        {copied ? 'copied' : 'copy'}
                      </button>
                    </>
                  ) : (
                    hint
                  )}
                </p>

                {/* Send: a lime pill with a maroon disc holding a lime arrow */}
                <button
                  ref={sendScope}
                  type="submit"
                  disabled={status === 'sending'}
                  className="group/send inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-[var(--lime)] pl-6 pr-1.5 font-body text-base font-medium text-[var(--maroon)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--paper)] disabled:cursor-progress"
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                  <span aria-hidden className="grid size-9 place-items-center rounded-full bg-[var(--maroon)] text-[var(--lime)] transition-transform duration-300 group-hover/send:translate-x-0.5">
                    ➤
                  </span>
                </button>
              </div>
            </div>

            {/* Other ways to reach Alaa */}
            <p className="mt-8 m-0 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-body text-sm text-[var(--paper-soft)]">
              <span className="font-heading italic text-base">Prefer another way?</span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline text-[var(--paper-full)]">
                Resume
              </a>
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline text-[var(--paper-full)]">
                  {link.label === 'Linkedin' ? 'LinkedIn' : link.label === 'Github' ? 'GitHub' : link.label}
                </a>
              ))}
              <span>
                <a href={`mailto:${contactEmail}`} className="underline-offset-4 hover:underline text-[var(--paper-full)]">
                  {contactEmail}
                </a>
                {' · '}
                <button type="button" onClick={copyEmail} className="underline underline-offset-4 decoration-[var(--lime)]">
                  {copied ? 'copied' : 'copy'}
                </button>
              </span>
            </p>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

// ---- One step of the ink-fill intro: starts at 12% opacity and brightens to full at its turn ----
function Ink({ i, start, reduced, children }: { i: number; start: number; reduced: boolean; children: ReactNode }) {
  return (
    <motion.span
      initial={reduced ? false : { opacity: INK_START }}
      animate={{ opacity: 1 }}
      transition={{ duration: INK_DURATION, delay: start + 0.1 + i * INK_STAGGER, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}

// ---- The underline under every blank: its look carries the state, not just its colour ----
//   empty   → thin-looking paper at 50%, solid
//   valid   → lime, solid
//   invalid → full paper, dashed (and aria-invalid on the field)
function underline(state: BlankState) {
  const color = state === 'valid' ? 'var(--lime)' : state === 'invalid' ? 'var(--paper-full)' : 'var(--paper-line)';
  return `2.5px ${state === 'invalid' ? 'dashed' : 'solid'} ${color}`;
}

const blankText =
  'bg-transparent p-0 text-[var(--paper-full)] placeholder:text-[var(--paper-faint)] outline-none caret-[var(--lime)]';

// ---- A one-line blank (name, email). It's as wide as what's typed (or its placeholder): an invisible copy of the
// text sets the width (the same idea as sizing it in `ch`, but exact for a font where letters differ in width),
// and the input sits on top of it in the same grid cell ----
function TextBlank({
  inputRef,
  label,
  placeholder,
  value,
  onChange,
  state,
  onEnter,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  state: BlankState;
  onEnter: () => void;
  type?: string;
  autoComplete?: string;
  inputMode?: 'email';
}) {
  return (
    <span
      className="inline-grid rounded-t-[0.15em] px-[0.08em] transition-[border-color,background-color] duration-200 focus-within:bg-[var(--paper-focus)]"
      style={{ borderBottom: underline(state) }}
    >
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre">
        {value || placeholder}
      </span>
      <input
        ref={inputRef}
        type={type}
        // size={1}: an input is ~20 characters wide by default, which would stop it shrinking to its text
        size={1}
        aria-label={label}
        aria-invalid={state === 'invalid'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Enter jumps to the next blank instead of sending the form
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
          }
        }}
        className={`col-start-1 row-start-1 w-full min-w-[2ch] ${blankText}`}
      />
    </span>
  );
}

// ---- The message: a textarea that grows with what's typed (its height follows its content) ----
function MessageBlank({
  textareaRef,
  placeholder,
  value,
  onChange,
  state,
  onSubmitShortcut,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  state: BlankState;
  onSubmitShortcut: () => void;
}) {
  // After every change: shrink to one line, then grow to fit everything (scrollHeight = the content's height)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, placeholder, textareaRef]);

  return (
    <span
      className="mt-2 block rounded-t-[0.15em] px-[0.08em] transition-[border-color,background-color] duration-200 focus-within:bg-[var(--paper-focus)]"
      style={{ borderBottom: underline(state) }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        aria-label="Your message"
        aria-invalid={state === 'invalid'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Ctrl+Enter (Cmd+Enter on a Mac) sends; plain Enter is a new line
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSubmitShortcut();
          }
        }}
        className={`block w-full resize-none overflow-hidden ${blankText}`}
      />
    </span>
  );
}

// ---- The topic blank: a button that opens a small menu (a "listbox") of the three topics ----
function TopicBlank({
  buttonRef,
  index,
  open,
  setOpen,
  reduced,
  onPick,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  index: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  reduced: boolean;
  onPick: (index: number) => void;
}) {
  const listRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(index); // the option the arrow keys are on
  // Which way the menu opens, so it stays on screen: under the blank (or above it if there's no room below),
  // lined up with its left edge (or its right edge near the right side of the screen)
  const [place, setPlace] = useState({ above: false, alignRight: false });

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setPlace({
        above: window.innerHeight - rect.bottom < 200 && rect.top > 200,
        alignRight: rect.left + 260 > window.innerWidth - 16,
      });
    }
    setActive(index);
    listRef.current?.focus({ preventScroll: true });

    // A click anywhere outside the menu and its button closes it
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!listRef.current?.contains(target) && !button?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, index, buttonRef, setOpen]);

  const pick = (i: number) => {
    onPick(i);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKey = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'ArrowDown') setActive((a) => (a + 1) % TOPICS.length);
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + TOPICS.length) % TOPICS.length);
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(TOPICS.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') pick(active);
    else if (e.key === 'Escape') {
      // Esc closes only this menu, not the whole contact card: stopPropagation keeps it from reaching the card
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <span className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Topic: ${TOPICS[index].label}`}
        onClick={() => setOpen(!open)}
        className="inline-flex items-baseline gap-[0.2em] rounded-t-[0.15em] px-[0.08em] text-[var(--paper-full)] outline-none focus-visible:bg-[var(--paper-focus)]"
        style={{ borderBottom: underline('valid') }}
      >
        {/* The chosen topic rolls to the new one when it changes */}
        <RollText id={TOPICS[index].label} instant={reduced} duration={0.45}>
          {TOPICS[index].label}
        </RollText>
        <span aria-hidden className={`text-[0.6em] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* The menu. Spans with list roles rather than <ul>/<li>: it sits inside the sentence's paragraph, and a
          list isn't allowed inside a <p> in HTML. role="listbox"/"option" tell assistive tech what it is.
          data-lenis-prevent: the smooth scroll leaves the wheel alone over it */}
      {open && (
        <span
          ref={listRef}
          data-lenis-prevent
          role="listbox"
          tabIndex={-1}
          aria-label="Topic"
          aria-activedescendant={`topic-option-${active}`}
          onKeyDown={onListKey}
          className={`absolute z-20 block w-max min-w-[15rem] rounded-xl bg-[var(--paper)] p-1.5 font-body text-base leading-normal text-[var(--maroon)] shadow-[0_12px_32px_var(--scrim)] outline-none ${
            place.above ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${place.alignRight ? 'right-0' : 'left-0'}`}
        >
          {TOPICS.map((t, i) => (
            <span
              key={t.label}
              id={`topic-option-${i}`}
              role="option"
              aria-selected={i === index}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
              // Chosen: lime with a ✓. Keyboard position: a maroon ring (a shape, not only a colour)
              className={`flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2 ${
                i === index ? 'bg-[var(--lime)]' : ''
              } ${i === active ? 'ring-2 ring-inset ring-[var(--maroon)]' : ''}`}
            >
              {t.label}
              <span aria-hidden className={i === index ? '' : 'invisible'}>
                ✓
              </span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

// ---- After a successful send: a line that types itself in ----
function ThankYou({ firstName, email, reduced }: { firstName: string; email: string; reduced: boolean }) {
  // The form (and the field that had focus) just disappeared: hold focus here so it stays inside the card
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);

  const start = `Thanks, ${firstName}. I’ll reply to ${email} `;
  const lime = 'within a day.';
  const full = start + lime;
  // How many characters are showing; goes up by one every 22ms until the whole line is there
  const [shown, setShown] = useState(reduced ? full.length : 0);
  useEffect(() => {
    if (reduced || shown >= full.length) return;
    // One more character in 22ms; each new value of `shown` runs this again, until the line is complete
    const timer = window.setTimeout(() => setShown((n) => n + 1), 22);
    return () => window.clearTimeout(timer);
  }, [shown, full.length, reduced]);

  return (
    <motion.p
      ref={ref}
      tabIndex={-1}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="m-0 font-body font-medium text-[length:clamp(21px,2.9vw,40px)] leading-[1.6] text-[var(--paper-full)] outline-none"
    >
      {/* Screen readers get the whole line at once; the typing is only visual */}
      <span className="sr-only" role="status">
        {full}
      </span>
      <span aria-hidden>
        {start.slice(0, shown)}
        <span className="text-[var(--lime)]">{lime.slice(0, Math.max(0, shown - start.length))}</span>
      </span>
    </motion.p>
  );
}
