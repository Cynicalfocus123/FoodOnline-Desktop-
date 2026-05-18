import { news } from "../data/home";

export function Footer() {
  return (
    <footer id="company" className="bg-ink px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <section>
          <h2 className="text-xl font-black">Our mission</h2>
          <p className="mt-4 leading-7 text-white/68">
            Make fresh food ordering calm, transparent, and fast for every desktop shopper.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-black">Company news</h2>
          <ul className="mt-4 space-y-3 text-white/68">
            {news.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-black">Contact us</h2>
          <div className="mt-4 space-y-3 text-white/68">
            <p>support@foodonlines.com</p>
            <p>+66 02 555 0198</p>
            <p>Bangkok operations desk, daily 8:00-22:00</p>
          </div>
        </section>
      </div>
    </footer>
  );
}
