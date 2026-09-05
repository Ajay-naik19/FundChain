import { useEffect, useState } from "react"
import {
  JsonRpcProvider,
  Contract,
  formatEther
} from "ethers"
import { Link } from "react-router-dom"
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS
} from "../contract"

type Campaign = {
  owner: string
  title: string
  description: string
  target: bigint
  deadline: bigint
  amountCollected: bigint
}

const SEPOLIA_RPC_URL =
  "https://ethereum-sepolia-rpc.publicnode.com"

function Explore() {
  const [campaigns, setCampaigns] =
    useState<Campaign[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  async function loadCampaigns() {
    try {
      setLoading(true)
      setError("")

      /*
       * Read blockchain data directly
       * from Sepolia.
       *
       * MetaMask is NOT required just
       * to view campaigns.
       */
      const provider =
        new JsonRpcProvider(
          SEPOLIA_RPC_URL
        )

      const contract =
        new Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        )

      const data =
        await contract.getCampaigns()

      setCampaigns(data)
    } catch (error) {
      console.error(
        "Error loading campaigns:",
        error
      )

      setError(
        "Unable to load campaigns from Sepolia blockchain."
      )
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
        <h1>
          Explore Campaigns
        </h1>

        <p>
          Discover campaigns and support projects
          you believe in.
        </p>
      </section>

      <section className="campaign-section">

        <div className="campaign-container">

          {loading ? (
            <p>
              Loading campaigns from blockchain...
            </p>
          ) : error ? (
            <p>
              {error}
            </p>
          ) : campaigns.length === 0 ? (
            <p>
              No campaigns found.
            </p>
          ) : (
            campaigns.map(
              (campaign, index) => {

                /*
                 * Convert blockchain values
                 * from Wei to ETH.
                 */
                const target =
                  Number(
                    formatEther(
                      campaign.target
                    )
                  )

                const collected =
                  Number(
                    formatEther(
                      campaign.amountCollected
                    )
                  )

                /*
                 * Calculate funding percentage.
                 */
                const percentage =
                  target > 0
                    ? Math.min(
                        (collected / target) * 100,
                        100
                      )
                    : 0

                /*
                 * Convert Unix timestamp
                 * to JavaScript Date.
                 */
                const deadline =
                  new Date(
                    Number(
                      campaign.deadline
                    ) * 1000
                  )

                /*
                 * Get IPFS CID saved after
                 * campaign creation.
                 */
                const ipfsCid =
                  localStorage.getItem(
                    `fundchain-ipfs-${index}`
                  )

                /*
                 * Older campaigns may have
                 * an image saved using the
                 * previous localStorage key.
                 */
                const oldImage =
                  localStorage.getItem(
                    `fundchain-image-${index}`
                  )

                /*
                 * Build Pinata/IPFS image URL.
                 */
                const ipfsImage =
                  ipfsCid
                    ? `https://gateway.pinata.cloud/ipfs/${ipfsCid}`
                    : ""

                /*
                 * Use the new IPFS image first.
                 * Fall back to an older local image.
                 */
                const image =
                  ipfsImage || oldImage

                return (
                  <div
                    className="campaign-card"
                    key={index}
                  >

                    {image ? (
                      <img
                        src={image}
                        alt={campaign.title}
                        className="campaign-image"
                      />
                    ) : (
                      <div className="campaign-image education-image">
                        Campaign
                      </div>
                    )}

                    <h3>
                      {campaign.title}
                    </h3>

                    <p>
                      {campaign.description}
                    </p>

                    <p className="raised">
                      Raised:{" "}
                      {collected.toFixed(4)}
                      {" ETH / "}
                      {target.toFixed(4)}
                      {" ETH"}
                    </p>

                    <div className="progress-background">

                      <div
                        className="progress-bar"
                        style={{
                          width:
                            `${percentage}%`
                        }}
                      ></div>

                    </div>

                    <p>
                      {percentage.toFixed(0)}
                      % funded
                    </p>

                    <p>
                      Deadline:{" "}
                      {deadline.toLocaleDateString()}
                    </p>

                    <Link
                      to={`/campaign/${index}`}
                      style={{
                        textDecoration:
                          "none"
                      }}
                    >
                      <button>
                        View Campaign
                      </button>
                    </Link>

                  </div>
                )
              }
            )
          )}

        </div>

      </section>

    </div>
  )
}

export default Explore