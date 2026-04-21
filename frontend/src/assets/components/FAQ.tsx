import "../../css/faq.css";
import React, { useState, Suspense } from "react";
function FAQ() {
  const FAQChatBot = React.lazy(() => import("./FAQChatBot"));

  return (
    <div>
      <div className="faq">
        <h3>Popular asked question </h3>

        <Suspense fallback={<div>Loading Chati...</div>}>
          <FAQChatBot />
        </Suspense>

        <div className="cont">
          <h4>What makes LetusDonate Different? </h4>

          <ul>
            <li>
              •Focus on sustainability: unlike standard charities , LetUsDonate
              prioritises environmentally conscious donation practices.
            </li>
            <li>
              •Donate your way: we allow users to choose how to donate their
              clothing. On your chosen day, we’ll either collect your donation
              or you can drop it off at one of our partner charity locations.
              You’ll even get a reminder with your collection details.{" "}
            </li>
            <li>
              •See your impact: you can track your sustainability impact — from
              CO₂ saved to people helped{" "}
            </li>
          </ul>
        </div>

        <div className="cont">
          <h4>What can I donate?</h4>

          <ul>
            <li>•Good quality clean adults’ and children’s clothing</li>
            <li>•Pairs of shoes.</li>
            <li>•Handbags & belts </li>
            <li>•Unused underwear & swimwear </li>
          </ul>
        </div>

        <div className="cont">
          <h4>How do I book a collection </h4>

          <h5> All it takes is 3 easy steps:</h5>

          <ul>
            <li> 1: Login or create an account </li>
            <li>
              {" "}
              2: Go to the donations page on the website and fill out the
              donation form.{" "}
            </li>
            <li> 3: Then select a date, time and location.</li>
            <li> </li>
          </ul>

          <br></br>
          <br></br>

          <p>
            {" "}
            Then you are all sorted, and a Volunteer or partner courier will
            collect you donation.
          </p>
        </div>

        <div className="cont">
          <h4>How much money goes to my chosen charity? </h4>

          <p> 100% of all profits go to the chosen charity. </p>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
