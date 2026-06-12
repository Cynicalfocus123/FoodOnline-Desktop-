const generalSections = [
  {
    title: "Special notes on Replacement and Refund",
    paragraphs: [
      "Due to shipping and duty tax cost, if you receive product(s) that is damaged, missing, expired, defective or have a quality issue, we will process the refund for the product(s).",
      "If your package is returned due to personal reasons, we will not be able to refund you the duty tax. We will refund you the product(s) and shipping fee.",
    ],
  },
  {
    title: "Received product with issues?",
    paragraphs: [
      "If you receive products that is defective, damaged, expired, or have quality issue, you may request to return the product within the allowed return period. Foodonlines.com processes your request within 1-3 business days.",
      "If the item is in stock, you have the option for a refund or a replacement.",
      "If the items are out of stock, we will process a refund for you.",
    ],
  },
];

const nonReturnableItems = [
  "Due to the safety of our customers, consumable products such as food, snacks, dry goods, health supplements, and prepared goods are not eligible for return, unless the product is defective or has a quality issue.",
  "Products that are misused, damaged, modified, or in unsellable condition due to customer tampering.",
  "Products that are missing parts, missing or altered labels, or missing or altered serial numbers.",
  "Products that caused an allergic reaction due to a personal health condition. If you are not familiar with the product, we recommend checking its ingredients or consulting a certified medical physician prior to consuming or using it.",
  "Clearance products that were advertised as near-expired or marked with imperfections.",
  "Products that could cause personal hygiene concerns, such as undergarments and adult products, unless the product is defective or has a quality issue.",
  "All sales are final and cannot be refunded or exchanged. Items damaged in transit may be eligible for return after inspection.",
];

const freeReturnReasons = [
  "Product was damaged during shipping.",
  "We sent you the wrong item.",
  "Product is expired upon delivery.",
  "Product is defective or has a quality issue.",
];

const personalReturnReasons = [
  "Purchased the wrong item, size, color, or similar option.",
  "Purchased too many or no longer need the product.",
  "Unable to use the product due to an allergic reaction (eligible products only).",
  "Do not like the product, buyer's remorse, or another personal reason.",
];

const returnInstructions = [
  "All returns must have an RMA number. Please email our customer service team at info@foodonlines.com to request an RMA (Return Merchandise Authorization) number. Provide your order number, a picture of the product if requested, quantity, and reason for the return.",
  "For returns due to personal reasons, the item must be new and unopened. The customer is responsible for return shipping. An opened product or a product no longer in new condition may incur a restocking fee of 15% or more, or be refused, at Foodonlines.com's sole discretion.",
  "If we do not receive your return within 15 business days from the date the RMA was issued, the RMA will be cancelled.",
  "Include the item, all accessories, packaging materials, instruction manuals, documentation, and any free gift included in a combo. Missing articles may delay processing or cause rejection of the RMA.",
  "Once we receive your return, inspection and RMA processing may take 3-5 business days. Approved refunds are issued to the original payment method. Foodonlines.com Gift Cards or Reward Points are refunded first. Your bank may need an additional 3-5 business days to process the refund.",
];

const disclaimers = [
  "If you have any question or concern regarding the authenticity of a product, contact Foodonlines.com Customer Service. We may request written proof from the manufacturer or authorized distributor.",
  "If you experience discomfort or a medical issue, stop using or consuming the product and seek medical attention immediately.",
  "Written proof from a certified physician is required if you believe a product quality issue caused a medical issue.",
  "Foodonlines.com is not liable for issues with consumable products that are improperly stored.",
  "Product pictures are for reference only. Color, shade, or tone may differ slightly from the actual product due to lighting conditions.",
];

type CategoryPolicy = {
  title: string;
  category: string;
  period: string;
  qualifications: string[];
  notes?: string[];
};

const categoryPolicies: CategoryPolicy[] = [
  {
    title: "1. Food, Beverage, and Consumable Product Return Policy (Foodonlines.com)",
    category: "Food, Beverages, Snacks, Dry Goods",
    period: "Within 7 days of receipt of shipment.",
    qualifications: [
      "If a product is damaged or has a quality issue upon receipt, you may request a return within the return period.",
      "Contact info@foodonlines.com for an RMA number and provide your order number, a product picture if requested, quantity, and reason for the return.",
      "Requests are reviewed within 1-3 business days. Once damage or a quality issue is verified, a refund is issued and the item does not need to be returned.",
    ],
  },
  {
    title: "2. Beauty, Cosmetic, and Skin Care Products (Foodonlines.com)",
    category: "Beauty Products, Cosmetics, and Skin Care Products",
    period: "Within 30 days of receipt of shipment.",
    qualifications: [
      "A defective, damaged, or dead-on-arrival product may be returned within the return period.",
      "Returns for other eligible reasons must be new and unopened and requested within the return period.",
      "Removed or scratched-off authentication marks make a product ineligible for return.",
    ],
    notes: ["Additional Return Policy terms listed on the product page may apply."],
  },
  {
    title: "3. Home Appliances and Electronics Return Policy (Foodonlines.com)",
    category: "Home Appliances and Electronics",
    period: "Within 30 days from the date of delivery.",
    qualifications: [
      "A product damaged or dead on arrival may be returned within the return period.",
      "For personal-reason or wrong-item returns, the product must remain new and unopened.",
      "Original packaging, contents, components, accessories, and labels must be intact. A product found not to be brand-new and unused may incur a 15% restocking fee.",
      "Foodonlines.com is not responsible for data or media stored on a returned device. Export or remove all data before returning it.",
      "Customer-damaged, incomplete, or unsellable returns may incur a higher restocking fee or be refused.",
    ],
    notes: ["Keep all original packaging and contents during the first 30 days after receipt."],
  },
  {
    title: "4. Clothing and Footwear Return Policy (Foodonlines.com)",
    category: "Clothing and Footwear",
    period: "Within 30 days of receipt of shipment.",
    qualifications: [
      "A damaged product or a product with imperfections may be returned within the return period.",
      "For personal-reason or wrong-item returns, the product must be new, unopened or unused, and requested within the return period.",
      "Altered, washed, or worn products are not eligible for return.",
      "Products with missing or removed tags, labels, or packaging are not eligible for return.",
    ],
  },
  {
    title: "5. Maternal, Nursing, Baby Items, Toys, and Instruments (Foodonlines.com)",
    category: "Maternal Products, Nursing Products, Baby Products, Kids Toys, and Instruments",
    period: "Within 30 days of receipt of shipment.",
    qualifications: [
      "A damaged, expired, or poor-quality product may be returned within the return period.",
      "For personal-reason or wrong-item returns, the product must be new, unopened or unused, and requested within the return period.",
      "For food safety, baby formula is not eligible for return. Contact Foodonlines.com Customer Service within 7 days if there is a product issue; the formula will not need to be returned.",
    ],
  },
  {
    title: "6. Books, Music, Videos, and Educational Media Return Policy (Foodonlines.com)",
    category: "Books, Music, Videos, and Educational Media",
    period: "Within 3 days of receipt of shipment.",
    qualifications: [
      "A defective, damaged, or dead-on-arrival product may be returned within the return period.",
      "For personal-reason or wrong-item returns, the product must remain new and unopened and be requested within the return period.",
    ],
  },
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 list-disc space-y-3 pl-6 text-[15px] leading-7 text-neutral-700 sm:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ReturnPolicyPage() {
  return (
    <div className="bg-[#fffdf8] px-4 pb-20 pt-[150px] sm:px-6 sm:pt-[166px] lg:pt-[176px]">
      <article className="mx-auto max-w-5xl py-9 sm:py-12">
        <header className="border-b border-neutral-200 pb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Foodonlines.com</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-neutral-950 sm:text-5xl">Return Policy</h1>
          <p className="mt-6 text-base leading-8 text-neutral-700">
            Foodonlines.com is committed to providing customers with peace of mind when purchasing from us. Most items shipped from Foodonlines.com can be returned within 30 days of receipt. Food, beverages, snacks, dry goods, health supplements, and perishable goods must be reported within 7 days for damage or quality issues. Opened or used beauty products cannot be returned unless they have a quality issue. Some products have additional requirements described below.
          </p>
          <p className="mt-4 text-base leading-8 text-neutral-700">Thank you for your understanding and support.</p>
        </header>

        <section className="policy-section">
          <h2>Special categories</h2>
          <BulletList items={["Food, Drinks, and Consumables", "Beauty, Cosmetics, and Skin Care", "Home Appliances and Electronics", "Clothing and Footwear", "Maternal, Nursing, Baby Items, Toys, and Instruments", "Books, Music, Videos, and Educational Media"]} />
        </section>

        {generalSections.map((section) => (
          <section className="policy-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}

        <section className="policy-section">
          <h2>Can I return anything I want?</h2>
          <p>Although Foodonlines.com has a 30-day return policy on most products, items in the following conditions are not eligible for return:</p>
          <BulletList items={nonReturnableItems} />
        </section>

        <section className="policy-section">
          <h2>Who pays for return shipping?</h2>
          <p>Foodonlines.com will provide a free return shipping label for the following reasons:</p>
          <BulletList items={freeReturnReasons} />
          <p>If you are returning a product for a personal reason, you are responsible for return shipping. Personal reasons include:</p>
          <BulletList items={personalReturnReasons} />
        </section>

        <section className="policy-section"><h2>Return Instructions</h2><BulletList items={returnInstructions} /></section>
        <section className="policy-section"><h2>Important Disclaimers</h2><BulletList items={disclaimers} /></section>

        <section className="policy-section">
          <h2>Special category policies</h2>
          <div className="mt-6 space-y-8">
            {categoryPolicies.map((policy) => (
              <section className="border-t border-neutral-200 pt-7 first:border-t-0 first:pt-0" key={policy.title}>
                <h3>{policy.title}</h3>
                <p><strong>Category:</strong> {policy.category}</p>
                <p><strong>Return Period:</strong> {policy.period}</p>
                <p><strong>Return Qualification and Instructions:</strong></p>
                <BulletList items={policy.qualifications} />
                <p>Contact Foodonlines.com Customer Service at <a href="tel:+66973924632">+66-97-392-4632</a> or <a href="mailto:info@foodonlines.com">info@foodonlines.com</a> to request an RMA and provide your order details.</p>
                <p>Approved refunds are issued to the original payment method. Gift Card or Reward Point balances are refunded first, and bank processing may take 3-5 business days.</p>
                {policy.notes?.map((note) => <p key={note}><strong>Note:</strong> {note}</p>)}
              </section>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
