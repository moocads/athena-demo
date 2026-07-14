/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
import { benefits, categories, instructions, reviews } from "@/data/athena-content";
import { featuredProducts, type Product } from "@/data/athena-products";

function SectionHeader({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`section-header section-header--${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="announcement">Clean nutrition. Made for every day.</div>
      <nav className="nav-shell" aria-label="Primary navigation">
        <button className="icon-button mobile-only" aria-label="Open menu">
          <span />
          <span />
        </button>
        <a className="brand" href="/" aria-label="Athena Health & Beauty home">
          <img
            src="/images/athena/athena-logo.svg"
            alt=""
            width={44}
            height={44}
          />
          <span>Athena</span>
        </a>
        <div className="desktop-nav">
          {["Shop", "Collagen", "Protein", "Our Story", "Journal"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
              {item}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a className="desktop-action" href="/search">
            Search
          </a>
          <a className="desktop-action" href="/account">
            Account
          </a>
          <a href="/cart">Cart</a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[820px] overflow-hidden px-[clamp(20px,4.2vw,60px)] pb-20 pt-40 max-[1440px]:min-h-[78vh] max-[980px]:pt-[120px] max-sm:min-h-[80vh] max-sm:px-5">
      <img
        className="absolute inset-0 size-full object-cover max-sm:object-[66%_50%]"
        src="/images/athena/hero.jpg"
        alt="Athena collagen and protein containers styled with coffee and a protein shake in a warm kitchen."
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,245,240,0.92)_0%,rgba(247,245,240,0.66)_34%,rgba(247,245,240,0.05)_70%)] max-sm:bg-[linear-gradient(180deg,rgba(247,245,240,0.8),rgba(247,245,240,0.56)_52%,rgba(247,245,240,0.16))]"
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-[560px] max-w-[620px] flex-col justify-center max-[980px]:min-h-[52vh]">
        <p className="text-[11px] font-bold uppercase leading-[1.2] tracking-[0.1em] text-[var(--color-brand-gold-dark)]">
          Modern wellness nutrition
        </p>
        <h1 className="mt-[18px] max-w-[620px] font-[family-name:var(--font-heading)] text-[clamp(40px,5vw,64px)] font-semibold leading-[1.05]">
          Everyday Wellness, Elevated.
        </h1>
        <p className="mt-6 max-w-[560px] text-[clamp(17px,1.4vw,18px)] leading-[1.65] text-[var(--color-text-secondary)]">
          Clean, high-quality nutrition created to support the way you move,
          feel and live.
        </p>
        <div className="mt-[34px] flex flex-wrap gap-3 max-sm:flex-col">
          <a
            className="inline-flex min-h-[52px] items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-text-primary)] px-7 text-[13px] font-bold  leading-none tracking-[0.07em] !text-white transition-[background,color,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-px hover:bg-[#2a2a2a] max-sm:w-full"
            href="#shop"
          >
            Shop Best Sellers
          </a>
          <a
            className="inline-flex min-h-[52px] items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-transparent px-7 text-[13px] font-bold  leading-none tracking-[0.07em] text-[var(--color-text-primary)] transition-[background,color,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-px hover:bg-[var(--color-text-primary)] hover:text-[var(--color-text-inverse)] max-sm:w-full"
            href="#our-story"
          >
            Discover Athena
          </a>
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section className="section" id="shop">
      <SectionHeader
        title="Find Your Daily Essential"
        body="From effortless collagen to high-protein nutrition, Athena makes it easier to build wellness into your everyday routine."
      />
      <div className="category-grid">
        {categories.map((category) => (
          <a className="category-card" href={category.href} key={category.title}>
            <img
              src={category.image}
              alt=""
            />
            <div className="category-card__content">
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <span>{category.cta} &rarr;</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <a className="product-media aspect-square" href={product.slug}>
        <img
          className="object-cover"
          src={product.image}
          alt={`${product.name} product lifestyle image.`}
        />
      </a>
      <div className="product-meta">
        <div>
          <p className="product-rating">★★★★★ {product.reviewCount} reviews</p>
          <h3>{product.name}</h3>
        </div>
        <p className="product-price">{product.price}</p>
      </div>
      <p className="product-description">{product.description}</p>
      <p className="product-size">{product.size}</p>
      <div className="tag-row">
        {product.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <button className="button button--primary product-button">Quick Add</button>
    </article>
  );
}

function FeaturedProducts() {
  return (
    <section className="section section--warm" id="collagen">
      <SectionHeader
        eyebrow="Best sellers"
        title="The Athena Essentials"
        body="Thoughtfully formulated nutrition for everyday wellness and performance."
      />
      <div className="product-grid m-0">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function BenefitsBar() {
  return (
    <section className="benefits-bar" aria-label="Athena benefits">
      {benefits.map((benefit) => (
        <div className="benefit-item" key={benefit.title}>
          <span>{benefit.icon}</span>
          <h3>{benefit.title}</h3>
          <p>{benefit.body}</p>
        </div>
      ))}
    </section>
  );
}

function EditorialSplit() {
  return (
    <section className="section split-section">
      <div className="split-image">
        <img
          src="/images/athena/collagen-lifestyle.jpg"
          alt="Collagen being mixed into coffee as part of a morning routine."
        />
      </div>
      <div className="split-content">
        <p className="eyebrow">Collagen peptide</p>
        <h2>Beauty Starts With Your Daily Routine.</h2>
        <p>
          Athena Unflavoured Collagen Peptide delivers 10 g of hydrolyzed Type I
          & III collagen in every scoop. Its unflavoured formula mixes easily
          into coffee, smoothies, water or your favourite recipes.
        </p>
        <div className="stat-grid">
          <div>
            <strong>10 G</strong>
            <span>Collagen per scoop</span>
          </div>
          <div>
            <strong>Type I & III</strong>
            <span>Collagen</span>
          </div>
          <div>
            <strong>0 G</strong>
            <span>Sugar</span>
          </div>
        </div>
        <a className="button button--primary" href="/collections/collagen">
          Shop Collagen
        </a>
      </div>
    </section>
  );
}

function LifestyleBanner() {
  return (
    <section className="lifestyle-banner" id="protein">
      <img
        src="/images/athena/protein-lifestyle.jpg"
        alt="Cookies and cream protein shake with a premium whey protein container."
      />
      <div className="banner-content">
        <p className="eyebrow">Whey protein</p>
        <h2>Performance That Tastes Like A Reward.</h2>
        <p>30 g of whey protein with the rich, creamy taste of cookies and cream.</p>
        <a className="button button--secondary" href="/collections/protein">
          Shop Whey Protein
        </a>
      </div>
    </section>
  );
}

function HowToEnjoy() {
  return (
    <section className="section">
      <SectionHeader title="Made For Your Routine" />
      <div className="instruction-grid">
        {instructions.map((item, index) => (
          <article className="instruction-card" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="section split-section split-section--reverse" id="our-story">
      <div className="split-content">
        <p className="eyebrow">Our story</p>
        <h2>Wellness Without The Complication.</h2>
        <p>
          At Athena Health & Beauty, we believe good nutrition should feel
          simple, enjoyable and easy to maintain. Our products are created to
          complement real routines, from morning coffee and daily smoothies to
          workouts and recovery.
        </p>
        <a className="button button--secondary" href="/pages/our-story">
          Our Story
        </a>
      </div>
      <div className="split-image">
        <img
          src="/images/athena/brand-story.jpg"
          alt="A person preparing a smoothie in a calm modern kitchen."
        />
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="section section--warm">
      <SectionHeader title="Loved By The Athena Community" />
      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.name}>
            <p className="stars">★★★★★</p>
            <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
            <div>
              <strong>{review.name}</strong>
              <span>Verified Buyer · {review.product}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">Join Athena</p>
        <h2>Your Routine, Upgraded.</h2>
        <p>
          Get wellness tips, product updates and exclusive offers delivered to
          your inbox.
        </p>
      </div>
      <form className="newsletter-form">
        <label htmlFor="email">Email address</label>
        <div>
          <input id="email" type="email" placeholder="you@example.com" />
          <button className="button button--primary" type="submit">
            Join The Community
          </button>
        </div>
      </form>
    </section>
  );
}

function Footer() {
  const groups = {
    Shop: ["All Products", "Collagen", "Whey Protein"],
    About: ["Our Story", "Ingredients", "Journal"],
    Support: ["Contact", "Shipping", "Returns", "FAQ"],
    Follow: ["Instagram", "TikTok", "YouTube"],
  };

  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src="/images/athena/athena-logo.svg" alt="" width={100} height={100} />
        <h2>Athena Health & Beauty</h2>
        <p>Modern wellness nutrition for everyday strength, beauty, and balance.</p>
      </div>
      <div className="footer-links">
        {Object.entries(groups).map(([group, links]) => (
          <div key={group}>
            <h3>{group}</h3>
            {links.map((link) => (
              <a href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© Athena Health & Beauty</span>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}

export function AthenaHomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <BenefitsBar />
        <EditorialSplit />
        <LifestyleBanner />
        <HowToEnjoy />
        <BrandStory />
        <ReviewsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
