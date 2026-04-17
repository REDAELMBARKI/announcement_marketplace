import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/home.css";

const impactMetrics = [
  { icon: "📦", label: "Outfits Donated", value: 14500 },
  { icon: "🏷️", label: "Items Sold Secondhand", value: 9200 },
  { icon: "😊", label: "Families Helped", value: 679 },
];

const filterChips = [
  "0-12 mo",
  "1-2 yrs",
  "3-5 yrs",
  "6-8 yrs",
  "9-12 yrs",
  "Girls",
  "Boys",
  "Unisex",
];

const donationCauses = [
  {
    title: "Baby essentials for new mums",
    location: "Austin, Texas",
    timeline: "Ends in 2 Days",
    raised: 3400,
    goal: 5000,
    icon: "👶",
  },
  {
    title: "Winter jackets for kids, Devon",
    location: "Devon, UK",
    timeline: "Ends in 4 Days",
    raised: 1890,
    goal: 4500,
    icon: "🧥",
  },
  {
    title: "Backpacks for school restart",
    location: "Manchester, UK",
    timeline: "Ends in 3 Days",
    raised: 2100,
    goal: 4200,
    icon: "🎒",
  },
];

const marketplaceItems = [
  {
    title: "Floral Dress",
    age: "Age 3-4",
    type: "Girls",
    badge: "Like new",
    price: 4,
    image: "👗",
    tone: "mint",
  },
  {
    title: "Jeans Bundle",
    age: "Age 5-6",
    type: "Boys",
    badge: "Good cond.",
    price: 6,
    image: "👖",
    tone: "blue",
  },
  {
    title: "Teddy Plush Set",
    age: "Age 2-5",
    type: "Unisex",
    badge: "With tags",
    price: 5,
    image: "🧸",
    tone: "pink",
  },
  {
    title: "Winter Gloves Pack",
    age: "Age 6-8",
    type: "Unisex",
    badge: "Like new",
    price: 3,
    image: "🧤",
    tone: "cream",
  },
];

const activityFeed = [
  "Maria donated 2 winter coats in Bristol.",
  "Aisha listed a baby swing in Leeds.",
  "David gave $25 to the diaper drive.",
  "Sarah just bought the Paw Patrol set.",
  "Noah donated 3 uniforms in Austin.",
];

const testimonials = [
  {
    name: "Mia, parent of two",
    quote:
      "Sold two bags of kids clothes in a week and donated the rest. It feels easy and meaningful.",
  },
  {
    name: "Jordan, foster carer",
    quote:
      "We found warm coats and school gear locally in one place. The quality was better than expected.",
  },
  {
    name: "Nadia, volunteer",
    quote:
      "The live cause progress helps people act quickly. Donations arrive much faster now.",
  },
];

function Home() {
  const [activeFilter, setActiveFilter] = useState("0-12 mo");
  const [visibleActivity, setVisibleActivity] = useState(0);

  useEffect(() => {
    const feedInterval = setInterval(() => {
      setVisibleActivity((previous) => (previous + 1) % activityFeed.length);
    }, 3000);

    return () => clearInterval(feedInterval);
  }, []);

  return (
    <main className="home" id="home">
      <section className="hero_v2">
        <div className="hero_copy">
          <p className="eyebrow">PRE-LOVED KIDS CLOTHES</p>
          <h1>
            Give a little.
            <br />
            Change a lot.
          </h1>
          <p>
            Buy, sell, and donate children's clothing - every purchase supports a
            local family in need.
          </p>
          <div className="hero_actions">
            <Link to="/add_announcement" className="hero_primary">
              Browse clothes
            </Link>
            <Link to="/sign_up" className="hero_secondary">
              Donate now
            </Link>
          </div>

          <div className="hero_stats">
            {impactMetrics.map((metric) => (
              <div key={metric.label} className="hero_stat">
                <strong>{`${(metric.value / 1000).toFixed(1)}k`}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero_shape" aria-hidden="true">
          <div />
          <div />
        </div>
      </section>

      <section className="filter_strip">
        <p>Filter by age</p>
        <div>
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={chip === activeFilter ? "active" : ""}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section className="season_banner">
        <span className="season_icon" aria-hidden="true">
          ⭐
        </span>
        <div>
          <h3>Summer Clothing Drive - ends July 31</h3>
          <p>Donate summer essentials for kids heading back to school. 3 days left.</p>
        </div>
        <Link to="/sign_up">Donate now</Link>
      </section>

      <section className="tt-section dark_section">
        <div className="tt-section-head">
          <p className="eyebrow">VERIFIED CAUSES</p>
          <h3>Urgent donation causes</h3>
          <p>Campaigns with under 5 days left - your support makes a direct impact.</p>
        </div>
        <div className="cause_list">
          {donationCauses.map((cause) => {
            const progress = Math.round((cause.raised / cause.goal) * 100);
            return (
              <article key={cause.title} className="cause_item">
                <div className="cause_top">
                  <div className="cause_icon">{cause.icon}</div>
                  <div className="cause_meta">
                    <h4>{cause.title}</h4>
                    <p>
                      {cause.location} - {cause.timeline} <span>Verified</span>
                    </p>
                  </div>
                </div>
                <div className="tt-progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="cause_progress_text">
                  <p>
                    ${cause.raised.toLocaleString()} raised of $
                    {cause.goal.toLocaleString()}
                  </p>
                  <strong>{progress}%</strong>
                </div>
                <button type="button">Support this cause</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="tt-section dark_section">
        <div className="tt-section-head market_head">
          <div>
            <p className="eyebrow">MARKETPLACE</p>
            <h3>New arrivals</h3>
          </div>
          <Link to="/add_announcement">See all</Link>
        </div>
        <div className="market_grid_v2">
          {marketplaceItems.map((item) => (
            <article key={item.title} className="market_card_v2">
              <div className={`market_image_v2 ${item.tone}`}>
                <span>{item.badge}</span>
                <div>{item.image}</div>
              </div>
              <div className="market_body_v2">
                <h4>{item.title}</h4>
                <p>
                  {item.age} - {item.type}
                </p>
                <div className="market_price_row">
                  <strong>£{item.price}</strong>
                  <button type="button">Add to cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="impact_block">
        <h3>What your £5 does</h3>
        <div>
          <article>
            <strong>2</strong>
            <p>school notebooks and pencils for a child.</p>
          </article>
          <article>
            <strong>1</strong>
            <p>warm hoodie for a child in winter support programs.</p>
          </article>
          <article>
            <strong>3</strong>
            <p>pairs of socks distributed via partner charities.</p>
          </article>
        </div>
      </section>

      <section className="tt-how-it-works upgraded">
        <h3>How TinyTrove Works</h3>
        <div className="tt-how-grid">
          <article>
            <span>01</span>
            <h4>Gather Gear</h4>
            <p>Find gently used outfits and toys your kids have outgrown.</p>
          </article>
          <article>
            <span>02</span>
            <h4>Choose Your Path</h4>
            <p>Sell them for cash or donate them instantly to a verified cause.</p>
          </article>
          <article>
            <span>03</span>
            <h4>Make an Impact</h4>
            <p>Every item sold extends its life and supports children in need.</p>
          </article>
        </div>
      </section>

      <section className="grid_two">
        <article className="tt-activity-feed">
          <h3>Recently donated</h3>
          <div className="tt-activity-list">
            {[0, 1, 2, 3].map((offset) => {
              const item = activityFeed[(visibleActivity + offset) % activityFeed.length];
              return (
                <p key={item}>
                  <span aria-hidden="true">●</span> {item}
                </p>
              );
            })}
          </div>
        </article>

        <article className="map_section">
          <h3>Causes near you</h3>
          <p>Local drives active this week around your selected city.</p>
          <div className="map_mock" aria-label="Map preview">
            <span style={{ left: "28%", top: "35%" }}>📍</span>
            <span style={{ left: "54%", top: "45%" }}>📍</span>
            <span style={{ left: "70%", top: "30%" }}>📍</span>
            <span style={{ left: "62%", top: "67%" }}>📍</span>
          </div>
          <button type="button">View map and nearby causes</button>
        </article>
      </section>

      <section className="testimonials">
        <h3>Trusted by local parents</h3>
        <div>
          {testimonials.map((item) => (
            <article key={item.name}>
              <div className="avatar" aria-hidden="true">
                👤
              </div>
              <p>"{item.quote}"</p>
              <strong>{item.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="tt-main-footer">
        <div>
          <h4>TinyTrove</h4>
          <p>
            Buy and donate pre-loved kids essentials while supporting verified local
            causes.
          </p>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul>
            <li>
              <Link to="/our_partners">About Us</Link>
            </li>
            <li>
              <Link to="/faq">How to Donate</Link>
            </li>
            <li>
              <Link to="/faq">Seller Fees</Link>
            </li>
            <li>
              <Link to="/faq">Safety</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Trusted Badges</h5>
          <p>✅ Secure Payments</p>
          <p>💙 Nonprofit Verified</p>
          <p>📲 App Store / Google Play</p>
          <input type="email" placeholder="Join our newsletter" aria-label="Newsletter email" />
        </div>
      </section>
    </main>
  );
}

export default Home;
