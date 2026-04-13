import React, { useState, useEffect } from "react";
import "../../../css/footer.css";

export function Cookie_Policy() {
  return (
    <div>
      <main>
        <div className="cookie-policy-container">
          <h2>Cookie Policy</h2>
          <p>
            At Let Us Donate UK, we use cookies to enhance your browsing
            experience on our website. This Cookie Policy explains what cookies
            are, how we use them, and your choices regarding their use.
          </p>
          <h3>1. What Are Cookies?</h3>
          <p>
            Cookies are small text files that are stored on your device when you
            visit a website. They help the website remember your preferences and
            improve your overall experience.
          </p>

          <h3>2. How We Use Cookies</h3>
          <p>We use cookies for various purposes, including:</p>

          <p>• To remember your login information and preferences.</p>
          <p>• To analyze website traffic and usage patterns.</p>
          <p>• To improve the functionality and performance of our website.</p>

          <h3>3. Types of Cookies We Use</h3>
          <p>
            We use both session cookies (which expire when you close your
            browser) and persistent cookies (which remain on your device for a
            set period of time).
          </p>

          <h3>4. Your Cookie Choices</h3>
          <p>
            You can manage your cookie preferences through your browser
            settings. Most browsers allow you to block or delete cookies, but
            please note that doing so may affect the functionality of our
            website.
          </p>
          <h3>5. Changes to This Cookie Policy</h3>
          <p>
            We may update this Cookie Policy from time to time. Any changes will
            be effective immediately upon posting on the website. Your continued
            use of the website after any changes constitutes your acceptance of
            the new Cookie Policy.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Cookie_Policy;
