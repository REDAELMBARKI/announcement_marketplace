import React, { useState, useEffect } from "react";
import "../../css/our_partners.css";

function Our_Partners() {
  return (
    <section className="charities">
      <h2>Charities We’re Proud to Work With</h2>
      <p className="charities_intro">
        We collaborate with compassionate organizations across the UK to make
        clothing donations more impactful and sustainable.
      </p>

      <div className="charity_grid">
        <div className="cont">
          <h3>WearAgain Foundation England</h3>
          <p>
            Helps low-income families by providing gently used clothes for work,
            school, and daily life. Working with thousands of families across
            England, WearAgain ensures children have proper school uniforms,
            parents can dress for job interviews, and households can meet basic
            clothing needs with pride and dignity.
          </p>

          <h4>How They Help:</h4>
          <ul>
            <li>Delivers quality clothing across England.</li>
            <li>Runs community clothing drives.</li>
            <li>Empowers job seekers with workwear and interview outfits.</li>
            <li>Builds stronger communities through volunteering.</li>
            <li>Reaches thousands of families every year.</li>
          </ul>
        </div>

        <div className="cont">
          <h3>Threads of Hope UK</h3>
          <p>
            Supports refugees and homeless individuals with essential clothing
            and footwear. Distributes coats, shoes, and everyday wear across the
            UK to help people stay warm and feel confident.
          </p>

          <h4>How They Help:</h4>
          <ul>
            <li>Runs seasonal drives to meet summer and winter needs.</li>
            <li>Helps refugees feel welcomed and included.</li>
            <li>
              Engages communities through fundraising and awareness events.
            </li>
          </ul>
        </div>

        <div className="cont">
          <h3>SecondChance Wardrobe</h3>
          <p>
            Collects and redistributes quality fashion items to women’s shelters
            and youth hostels — empowering vulnerable women and at-risk youth to
            rebuild their lives with dignity and style.
          </p>

          <h4>How They Help:</h4>
          <ul>
            <li>Turns pre-loved fashion into new opportunities.</li>
            <li>Supports job interviews and education access.</li>
            <li>Promotes sustainable, circular fashion.</li>
            <li>Encourages reuse and community compassion.</li>
          </ul>
        </div>

        <div className="cont">
          <h3>GreenStitch Collective</h3>
          <p>
            Focuses on textile recycling and sustainable fashion initiatives,
            inspiring communities to embrace ethical fashion choices.
          </p>

          <h4>Initiatives Include:</h4>
          <ul>
            <li>Community textile drop-off points.</li>
            <li>Collaborations with ethical brands.</li>
            <li>Workshops for repair and upcycling.</li>
            <li>Events selling pre-loved clothes and fabrics.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Our_Partners;
