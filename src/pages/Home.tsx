import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="home-page">

      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Fund Ideas.
            <br />
            Build the Future.
          </h1>

          <p>
            A decentralized crowdfunding platform powered by
            blockchain technology. Create campaigns, receive
            donations, and track funds transparently.
          </p>

          <div className="hero-buttons">

            <Link to="/explore">
              <button>
                Explore Campaigns
              </button>
            </Link>

            <Link to="/create">
              <button className="secondary-button">
                Create Campaign
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          STATISTICS
      ========================================= */}

      <section className="statistics">

        <div className="stat-box">
          <h3>100%</h3>
          <p>Blockchain Transparency</p>
        </div>

        <div className="stat-box">
          <h3>24/7</h3>
          <p>Access to Campaigns</p>
        </div>

        <div className="stat-box">
          <h3>ETH</h3>
          <p>Secure Donations</p>
        </div>

        <div className="stat-box">
          <h3>Web3</h3>
          <p>Decentralized Platform</p>
        </div>

      </section>


      {/* =========================================
          HOW FUNDCHAIN WORKS
      ========================================= */}

      <section className="how-section">

        <h2>
          How FundChain Works
        </h2>

        <p className="section-subtitle">
          Simple, transparent and powered by blockchain.
        </p>

        <div className="how-container">

          {/* Step 1 */}

          <div className="how-card">

            <div className="how-number">
              1
            </div>

            <h3>
              Create Campaign
            </h3>

            <p>
              Connect your MetaMask wallet and create a
              crowdfunding campaign with your target amount
              and deadline.
            </p>

          </div>


          {/* Step 2 */}

          <div className="how-card">

            <div className="how-number">
              2
            </div>

            <h3>
              Receive Donations
            </h3>

            <p>
              Supporters can donate ETH directly to your
              campaign through the blockchain.
            </p>

          </div>


          {/* Step 3 */}

          <div className="how-card">

            <div className="how-number">
              3
            </div>

            <h3>
              Track Progress
            </h3>

            <p>
              Monitor the amount raised, funding percentage,
              deadline and donor information transparently.
            </p>

          </div>


          {/* Step 4 */}

          <div className="how-card">

            <div className="how-number">
              4
            </div>

            <h3>
              Withdraw Funds
            </h3>

            <p>
              After the campaign deadline, the campaign
              owner can withdraw the collected funds.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          FEATURED CAMPAIGNS
      ========================================= */}

      <section className="campaign-section">

        <h2>
          Featured Campaigns
        </h2>

        <p className="section-subtitle">
          Support projects that can make a difference.
        </p>

        <div className="campaign-container">


          {/* =====================================
              EDUCATION
          ===================================== */}

          <div className="campaign-card">

            <div className="campaign-image education-image">
              Education
            </div>

            <h3>
              Education for Rural Children
            </h3>

            <p>
              Help provide educational resources, books,
              school supplies and learning materials to
              children in rural communities.
            </p>

            <p className="raised">
              <strong>
                Blockchain Based Campaign
              </strong>
            </p>

            <Link to="/explore">
              <button>
                View Campaigns
              </button>
            </Link>

          </div>


          {/* =====================================
              CLEAN WATER
          ===================================== */}

          <div className="campaign-card">

            <div className="campaign-image water-image">
              Clean Water
            </div>

            <h3>
              Clean Water Project
            </h3>

            <p>
              Support projects that aim to improve access
              to clean and safe drinking water.
            </p>

            <p className="raised">
              <strong>
                Transparent Donations
              </strong>
            </p>

            <Link to="/explore">
              <button>
                View Campaigns
              </button>
            </Link>

          </div>


          {/* =====================================
              STARTUP
          ===================================== */}

          <div className="campaign-card">

            <div className="campaign-image startup-image">
              Innovation
            </div>

            <h3>
              Startup Innovation
            </h3>

            <p>
              Support innovative ideas and technology
              projects through decentralized crowdfunding.
            </p>

            <p className="raised">
              <strong>
                Powered by Ethereum
              </strong>
            </p>

            <Link to="/explore">
              <button>
                View Campaigns
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          FINAL CALL TO ACTION
      ========================================= */}

      <section className="home-cta">

        <h2>
          Ready to Start Your Campaign?
        </h2>

        <p>
          Create a campaign and raise funds transparently
          using blockchain technology.
        </p>

        <Link to="/create">
          <button>
            Create Your Campaign
          </button>
        </Link>

      </section>

    </div>
  )
}

export default Home