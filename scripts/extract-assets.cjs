const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '../..');
const out = path.resolve(__dirname, '../public/brand');

async function extract() {
  const tasks = [
    // Home & Common
    { src: 'Home_page (1).png', rect: { left: 345, top: 720, width: 430, height: 260 }, dest: 'devices-mockup.webp' },
    
    // About Us
    { src: 'About_us_our_story.png', rect: { left: 450, top: 72, width: 574, height: 350 }, dest: 'about-hero.webp' },
    { src: 'About_us_our_story.png', rect: { left: 560, top: 1040, width: 464, height: 260 }, dest: 'about-mug.webp' },

    // Contact
    { src: 'Contact.png', rect: { left: 880, top: 90, width: 656, height: 690 }, dest: 'contact-balcony.webp' },
    { src: 'Contact_Owners_Inquiry.png', rect: { left: 0, top: 620, width: 320, height: 360 }, dest: 'inquiry-owner-desk.webp' },
    { src: 'Contact_Tenant_Inquiry.png', rect: { left: 0, top: 340, width: 330, height: 600 }, dest: 'inquiry-tenant-living.webp' },

    // Owners: Property Management
    { src: 'Owners_PropertyManagement.png', rect: { left: 420, top: 80, width: 604, height: 310 }, dest: 'owner-mgmt-hero.webp' },
    { src: 'Owners_PropertyManagement.png', rect: { left: 18, top: 630, width: 260, height: 215 }, dest: 'owner-living-sofa.webp' },
    { src: 'Owners_PropertyManagement.png', rect: { left: 410, top: 1080, width: 614, height: 250 }, dest: 'owner-mgmt-cta.webp' },

    // Owners: NRI
    { src: 'Owners_NRI_Property_Management.png', rect: { left: 430, top: 85, width: 1106, height: 335 }, dest: 'nri-hero.webp' },
    { src: 'Owners_NRI_Property_Management.png', rect: { left: 76, top: 565, width: 226, height: 180 }, dest: 'nri-card-building.webp' },
    { src: 'Owners_NRI_Property_Management.png', rect: { left: 285, top: 600, width: 210, height: 150 }, dest: 'nri-card-tablet.webp' },
    { src: 'Owners_NRI_Property_Management.png', rect: { left: 520, top: 630, width: 226, height: 130 }, dest: 'nri-card-statement.webp' },
    { src: 'Owners_NRI_Property_Management.png', rect: { left: 760, top: 580, width: 220, height: 180 }, dest: 'nri-card-travel.webp' },

    // Owners: Pricing & FAQs
    { src: 'Owners_Plans_and_Pricing.png', rect: { left: 560, top: 70, width: 464, height: 220 }, dest: 'pricing-hero.webp' },
    { src: 'Owners_FAQs.png', rect: { left: 480, top: 70, width: 544, height: 220 }, dest: 'faq-hero.webp' },
    { src: 'Owners_FAQs.png', rect: { left: 670, top: 300, width: 330, height: 228 }, dest: 'faq-devices.webp' },

    // Tenants: Find a Property
    { src: 'Tenants_Find_a_Property.png', rect: { left: 430, top: 70, width: 594, height: 200 }, dest: 'find-prop-hero.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 43, top: 326, width: 310, height: 134 }, dest: 'prop-1.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 369, top: 326, width: 310, height: 134 }, dest: 'prop-2.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 695, top: 326, width: 310, height: 134 }, dest: 'prop-3.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 43, top: 535, width: 310, height: 134 }, dest: 'prop-4.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 369, top: 535, width: 310, height: 134 }, dest: 'prop-5.webp' },
    { src: 'Tenants_Find_a_Property.png', rect: { left: 695, top: 535, width: 310, height: 134 }, dest: 'prop-6.webp' },

    // Tenants: Services
    { src: 'Tenants_Tenant_Services.png', rect: { left: 440, top: 70, width: 584, height: 275 }, dest: 'tenant-services-hero.webp' },
    { src: 'Tenants_Tenant_Services.png', rect: { left: 495, top: 520, width: 195, height: 320 }, dest: 'maintenance-phone.webp' },
    { src: 'Tenants_Tenant_Services.png', rect: { left: 32, top: 755, width: 320, height: 165 }, dest: 'tenant-cta-man.webp' },

    // WebAdmin
    { src: 'WebAdmin_Portal.png', rect: { left: 0, top: 0, width: 1527, height: 241 }, dest: 'webadmin-portal.webp' },
  ];

  for (const t of tasks) {
    const file = path.join(root, t.src);
    if (!fs.existsSync(file)) {
      console.warn(`File not found: ${file}`);
      continue;
    }
    const target = path.join(out, t.dest);
    try {
      await sharp(file)
        .extract(t.rect)
        .webp({ quality: 95 })
        .toFile(target);
      console.log(`Extracted ${t.dest}`);
    } catch (err) {
      console.error(`Failed ${t.dest}:`, err.message);
    }
  }
}

extract();
