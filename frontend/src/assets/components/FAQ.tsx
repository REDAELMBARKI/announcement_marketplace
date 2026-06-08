import "../../css/faq.css";
import React, { Suspense } from "react";
function FAQ() {
  const FAQChatBot = React.lazy(() => import("./FAQChatBot"));

  return (
    <div>
      <div className="faq">
        <h3>Frequently Asked Questions</h3>

        <Suspense fallback={<div>Loading Chat...</div>}>
          <FAQChatBot />
        </Suspense>

        <div className="cont">
          <h4>What is Announcements Marketplace?</h4>
          <p>
            Announcements Marketplace is a platform where users can buy, sell, or donate items. 
            Whether you're looking to find great deals, sell unwanted items, or give away things 
            to those in need, our marketplace connects you with local buyers and sellers.
          </p>
        </div>

        <div className="cont">
          <h4>What makes Announcements Marketplace Different? </h4>

          <ul>
            <li>
              •Focus on sustainability: unlike standard charities , Announcements Marketplace
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
          <h4>How do I create an announcement?</h4>
          <h5>Follow these simple steps:</h5>
          <ul>
            <li>1: Login or create a free account</li>
            <li>2: Click "Create Announcement" and fill in your item details</li>
            <li>3: Add photos and set your price or mark as donation</li>
            <li>4: Choose pickup location and contact preferences</li>
            <li>5: Publish your announcement</li>
          </ul>
        </div>

        <div className="cont">
          <h4>What can I sell or donate?</h4>
          <ul>
            <li>•Clothing and accessories for all ages</li>
            <li>•Electronics and gadgets</li>
            <li>•Home furniture and decor</li>
            <li>•Books and educational materials</li>
            <li>•Sports equipment</li>
            <li>•And much more!</li>
          </ul>
        </div>

        <div className="cont">
          <h4>How do transactions work?</h4>
          <p>
            Buyers and sellers can arrange pickup or delivery directly through the platform. 
            You can choose to meet in person, arrange delivery, or use our secure messaging 
            system to coordinate the exchange. For donations, simply coordinate pickup with 
            the recipient.
          </p>
        </div>

        <div className="cont">
          <h4>Is Announcement Marketplace safe to use?</h4>
          <p>
            Yes! We prioritize user safety with features like user ratings, secure messaging, 
            and verification options. Always meet in safe public locations and inspect items 
            before completing transactions.
          </p>
        </div>

        <div className="cont">
          <h4>Are there any fees for using the platform?</h4>
          <p>
            Creating announcements and browsing is free. We charge a small commission only on 
            successful sales. Donations are always free to post and receive.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
