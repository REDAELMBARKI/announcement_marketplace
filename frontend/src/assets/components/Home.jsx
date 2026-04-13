import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DonateImg from "../../images/Donate.png";
import DonateImg2 from "../../images/Donate2.png";
import DonateImg3 from "../../images/Donate3.png";
import DonateImg4 from "../../images/Donate4.png";
import "../../css/home.css";
// This is the home page component for the LetUsDonate.uk website
function Home() {
  const comment = [
    "I had so many clothes I never wore — this made it easy to donate them!",
    "Super convenient and I love that it helps real charities!",
    "No more plastic bags through the door. So much better!",
  ];

  const [currentComment, setCurrentComment] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentComment((prevIndex) => (prevIndex + 1) % comment.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [comment.length]);

  return (
    <section className="home" id="home">
      <div className="home_content">
        <Link to="/sign_up" className="joinus">
          Join Us
        </Link>
        <div className="or">
          <h2>or</h2>
        </div>
        <Link to="/login" className="login">
          Login
        </Link>
      </div>

      <div className="why_donate">
        <div className="why_text">
          <h2>Why Donate Clothes?</h2>
          <p>Free up space in your wardrobe , and leave your heart happy.</p>

          <p>
            Raise funds for a British charity of your choice, we give 82% of the
            proceeds to your chosen charity.
          </p>
          <p>
            Make your life easier, book a collection on a date that works for
            you, no more trips to the charity shop.
          </p>
          <p>
            Help us save the planet, your clothes don’t go to landfill, plus no
            more plastic bags through your door.
          </p>
          <p>
            Give your clothes a second home, and help people in need access
            affordable clothing.
          </p>
        </div>
        <div className="image">
          <img src={DonateImg} alt="People donating clothes" />
        </div>
      </div>

      <section className="charities">
        <h2>Charities We Are Working With...</h2>
        <div className="charity_text">
          <div>
            <h3>WearAgain Foundation</h3>
            <p>
              Helps low-income families by providing gently used clothes for
              work, school, and daily life.
            </p>
          </div>
          <div>
            <h3>Threads of Hope UK</h3>
            <p>
              Supports refugees and homeless individuals with essential clothing
              and footwear.
            </p>
          </div>
          <div>
            <h3>SecondChance Wardrobe</h3>
            <p>
              Collects and redistributes quality fashion items to women’s
              shelters and youth hostels.
            </p>
          </div>
          <div>
            <h3>GreenStitch Collective</h3>
            <p>
              Focuses on textile recycling and promoting sustainable fashion
              initiatives.
            </p>
          </div>
        </div>
      </section>

      <section className="Header">
        <h2>Here's Your Impact of the Day...</h2>
        <div className="impact_row">
          <div className="impact_info1">
            <p>Thanks to your donations, this many people have been helped:</p>
            <div className="co2_value">10 people!</div>
          </div>
          <div className="impact_info2">
            <p>Your clothes donations have saved:</p>
            <div className="co2_value">0 CO₂e</div>
          </div>
        </div>
      </section>

      <section className="Header" id="howitworks">
        <div className="image2">
          <img src={DonateImg2} alt="Illustration of donation process" />
        </div>
        <h2>How It Works</h2>
        <p>Donating Clothes The Easy Way</p>

        <div className="how_works_content">
          <div className="steps_container">
            <div className="step1">
              <h3>Log Your Donation</h3>
              <p>
                Follow simple steps once logged in to record your clothing
                donation online. Add short descriptions or photos so we know
                what you’re giving — it only takes a minute.
              </p>
            </div>

            <div className="step2">
              <h3>Bag Up Your Clothes</h3>
              <p>
                Pop your clean, pre-loved clothes into any bag or box. Make sure
                everything’s washed and ready to be re-loved by someone new.
              </p>
              <div className="image3">
                <img src={DonateImg4} alt="Bagging up donated clothes" />
              </div>
            </div>

            <div className="step3">
              <h3>We Collect or You Drop Off</h3>
              <p>
                On your chosen day, we’ll collect your donation or you can drop
                it off at a partner charity location. You’ll get a reminder with
                your collection details.
              </p>
            </div>

            <div className="step4">
              <h3>We Process Your Donation</h3>
              <p>
                Our partner charities carefully sort, categorise, and prepare
                your items for redistribution or resale to ensure they reach the
                right people.
              </p>
            </div>

            <div className="step5">
              <h3>Our Charity — and the Planet — Benefit</h3>
              <p>
                Once your clothes are reused or resold, your chosen charity
                receives direct support — and you can track your sustainability
                impact from CO₂ saved to people helped.
              </p>
            </div>
          </div>

          <div className="Please_Donate">
            <h3>Please Donate:</h3>
            <ul>
              <li>Good quality clean adults’ and children’s clothing</li>
              <li>Pairs of shoes</li>
              <li>Handbags & belts</li>
              <li>Unused underwear & swimwear</li>
            </ul>

            <h3>Please Don’t Give Us:</h3>
            <ul>
              <li>Stained or damaged clothing</li>
              <li>Duvets, pillows & cushions</li>
              <li>Books, DVDs, CDs & video games</li>
              <li>Coat hangers, lampshades & roller blinds</li>
              <li>Rugs</li>
              <li>Plastic toys, board games & puzzles</li>
              <li>Furniture & mattresses</li>
              <li>Large electrical items</li>
            </ul>

            <h3>Did You Know?</h3>
            <p>
              An estimated £140m worth of clothing is sent to UK landfill every
              year.
            </p>
            <p>
              The average UK household owns £4000 worth of clothes — and unused
              clothes in UK wardrobes are worth £30bn.
            </p>
            <p>
              <strong>Source:</strong> WRAP
            </p>

            <h3>Want to Know More?</h3>
            <p>Check out our FAQs:</p>
            <ul>
              <li>
                <Link to="/FAQ">What makes LetUsDonate different?</Link>
              </li>
              <li>
                <Link to="/FAQ">What can I donate?</Link>
              </li>
              <li>
                <Link to="/FAQ">How do I book a collection?</Link>
              </li>
              <li>
                <Link to="/FAQ">How much money goes to my chosen charity?</Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="Header">
        <h2>What People Have to Say About Us</h2>
        <div className="comments">
          <p className="comments">{comment[currentComment]}</p>
        </div>
      </section>

      <div className="home_content">
        <div className="image3">
          <img src={DonateImg3} alt="Happy donor after giving clothes" />
        </div>

        <div className="ready_text">
          <p>
            Ready to free up space in your wardrobe, and leave your heart happy?
          </p>
          <Link to="/sign_up" className="joinus">
            Join Us
          </Link>
          <div className="or">
            <h2>or</h2>
          </div>
          <Link to="/login" className="login">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
