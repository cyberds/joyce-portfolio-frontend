/**
 * The journey: one enquiry, followed all the way through. Six stations, each
 * written as something a business owner would actually recognise — what
 * normally happens, and what happens instead once the system is connected.
 */
export type Station = {
  id: string;
  index: string;
  title: string;
  before: string;
  after: string;
};

export const stations: Station[] = [
  {
    id: "enquiry",
    index: "01",
    title: "Someone gets in touch at 11pm",
    before: "Normally it sits in an inbox until somebody happens to notice it.",
    after:
      "It's captured the moment it arrives — from your website, your inbox or a message — and nothing has to be remembered.",
  },
  {
    id: "reply",
    index: "02",
    title: "They hear back straight away",
    before: "Normally you reply when you get a quiet ten minutes. Sometimes.",
    after:
      "A warm, properly written reply goes out in your voice, with the next step attached, while they're still interested.",
  },
  {
    id: "booking",
    index: "03",
    title: "The meeting arranges itself",
    before: "Normally that's six emails about which Tuesday works.",
    after:
      "They pick a time that already fits your diary. It's in both calendars before you've read the notification.",
  },
  {
    id: "record",
    index: "04",
    title: "Everything lands in one place",
    before: "Normally it's split across WhatsApp, email, a form and a folder.",
    after:
      "Their details, files and history sit in one record you can open in a second — before the call, not after it.",
  },
  {
    id: "followup",
    index: "05",
    title: "The follow-up actually happens",
    before: "Normally the good ones go quiet and you never quite chase them.",
    after:
      "The quote, the reminder, the nudge a week later — they go out on time, and stop the moment someone replies.",
  },
  {
    id: "clarity",
    index: "06",
    title: "You can see how the week went",
    before: "Normally you go on a feeling, and the feeling is 'busy'.",
    after:
      "Friday afternoon: what came in, what was won, what's waiting on you. One page, no spreadsheet archaeology.",
  },
];
