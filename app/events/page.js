import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Events | jchowlabs',
  description: 'Upcoming speaking engagements, conferences, and workshops that Jason Chow is attending or presenting at.',
};

const locationIcon = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const events = [
  { date: 'Feb 3, 2026', name: 'Cisco AI Summit' },
  { date: 'Feb 9, 2026', name: 'Vope AI x Lovable x Hathor | Build & Deploy Your Voice Agent Workshop + Hackathon' },
  { date: 'Feb 10, 2026', name: 'AI Agents SF - What\'s next for MCP?' },
  { date: 'Feb 11, 2026', name: 'Introducing the Agentic AI Risk Management Profile' },
  { date: 'Feb 11, 2026', name: 'AI Healthtech Night | Anthropic, Digital Ocean and Workato' },
  { date: 'Feb 16, 2026', name: 'Future of AI - Fireside w/CTO of Microsoft For Startups' },
  { date: 'Feb 17, 2026', name: 'Agentic + AI Observability Meetup SF' },
  { date: 'Feb 18, 2026', name: 'Voices of Voice AI' },
  { date: 'Feb 18, 2026', name: 'Hack Night: Hacking on OpenClaw' },
  { date: 'Feb 25, 2026', name: 'AI Demo Night at AWS Builder Loft' },
  { date: 'Mar 2, 2026', name: 'The DeepFake Summit' },
  { date: 'Mar 3, 2026', name: '[un]prompted | The AI Security Practitioner Conference' },
  { date: 'Mar 23\u201326, 2026', name: 'RSA Conference 2026' },
  { date: 'Apr 28\u201329, 2026', name: 'AI Dev 26 x SF' },
  { date: 'Jun 15\u201318, 2026', name: 'Identiverse 2026' },
  { date: 'Aug 1\u20132, 2026', name: 'Agentic AI Summit UC Berkeley' },
];

export default function EventsPage() {
  return (
    <div className="page-wrapper events-page">
      <Header />
      <main>
        <div className="events-container">
          {events.map((event, i) => (
            <div className="event-item" key={i}>
              <div className="event-icon">{locationIcon}</div>
              <div className="event-content">
                <div className="event-date">{event.date}</div>
                <div className="event-details">
                  <span className="event-name">{event.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
