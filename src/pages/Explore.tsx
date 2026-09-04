import { useEffect, useState } from "react"
import { BrowserProvider, Contract, formatEther } from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contract"

type Campaign = {
  owner: string
  title: string
  description: string
  target: bigint
  deadline: bigint
  amountCollected: bigint
}

function Explore() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCampaigns() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask")
        return
      }

      const provider = new BrowserProvider(window.ethereum)

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )

      const data = await contract.getCampaigns()

      setCampaigns(data)
    } catch (error) {
      console.error("Error loading campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  return (
    <div className="explore-page">

      <section>
        <h1>Explore Campaigns</h1>

        <p>
          Discover campaigns and support projects you believe in.
        </p>
      </section>

      <section className="campaign-section">

        <div className="campaign-container">

          {loading ? (
            <p>Loading campaigns from blockchain...</p>
          ) : campaigns.length === 0 ? (
            <p>No campaigns found.</p>
          ) : (
            campaigns.map((campaign, index) => {

              const target = Number(formatEther(campaign.target))
              const collected = Number(
                formatEther(campaign.amountCollected)
              )

              const percentage =
                target > 0
                  ? Math.min((collected / target) * 100, 100)
                  : 0

              const deadline = new Date(
                Number(campaign.deadline) * 1000
              )

              return (
                <div className="campaign-card" key={index}>

                 {localStorage.getItem(`fundchain-image-${index}`) ? (
  <img
    src={localStorage.getItem(`fundchain-image-${index}`) || ""}
    alt={campaign.title}
    className="campaign-image"
  />
) : (
  <div className="campaign-image education-image">
    Campaign
  </div>
)}
                  <h3>{campaign.title}</h3>

                  <p>{campaign.description}</p>

                  <p className="raised">
                    Raised: {collected.toFixed(4)} ETH /{" "}
                    {target.toFixed(4)} ETH
                  </p>

                  <div className="progress-background">
                    <div
                      className="progress-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <p>{percentage.toFixed(0)}% funded</p>

                  <p>
                    Deadline: {deadline.toLocaleDateString()}
                  </p>

                  <button
  onClick={() => {
    window.location.href = `/campaign/${index}`
  }}
>
  View Campaign
</button>

                </div>
              )
            })
          )}

        </div>

      </section>

    </div>
  )
}

export default Explore