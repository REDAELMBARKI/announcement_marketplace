import React, { useState, useEffect } from "react";
import "../../../css/footer.css";

export function Privacy_Policy() {
  return (
    <div>
      <main>
        <div className="privacy-policy-container">
          <h2>Privacy Policy</h2>
          <p>
            At Let Us Donate UK, we are committed to protecting your privacy.
            This Privacy Policy outlines how we collect, use, and safeguard your
            personal information when you use our website.
          </p>

          <h3>1. Information We Collect</h3>
          <p>
            We may collect personal information such as your name, email
            address, and donation history when you create an account or make a
            donation on our website.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            We use your personal information to process donations, manage your
            account, and communicate with you about our services and updates.
          </p>

          <h3>3. Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or
            destruction.
          </p>

          <h3>4. Third-Party Services</h3>
          <p>
            We may use third-party services to facilitate donations and manage
            our website. These services are bound by their own privacy policies.
          </p>

          <h3>5. Your Rights</h3>
          <p>
            You have the right to access, correct, or delete your personal
            information. You may also opt-out of receiving promotional emails
            from us at any time.
          </p>

          <h3>6. Changes to This Privacy Policy</h3>
          <p>
            We reserve the right to update this Privacy Policy at any time. Any
            changes will be effective immediately upon posting on the website.
            Your continued use of the website after any changes constitutes your
            acceptance of the new Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Privacy_Policy;
