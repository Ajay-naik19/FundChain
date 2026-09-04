import { useEffect, useState } from "react"
import {
  BrowserProvider,
  Contract,
  formatEther
} from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contract"

type Campaign = {
  owner: string
  title: string
  description: string
  target: bigint
  deadline: bigint
  amountCollected: bigint
}

type MyCampaign = Campaign & {
  campaignIndex: number
}

function Dashboard() {
  const [campaigns, setCampaigns] = useState<MyCampaign[]>([])
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)

  async function loadDashboard() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask")
        return
      }

      const provider = new BrowserProvider(window.ethereum)

      await provider.send("eth_requestAccounts", [])

      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setWalletAddress(address)

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )

      const allCampaigns = await contract.getCampaigns()

      const myCampaigns: MyCampaign[] = []

      for (let i = 0; i < allCampaigns.length; i++) {
        const campaign = allCampaigns[i]

        if (
          campaign.owner.toLowerCase() ===
          address.toLowerCase()
        ) {
          myCampaigns.push({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: campaign.target,
            deadline: campaign.deadline,
            amountCollected:
              campaign.amountCollected,
            campaignIndex: i
          })
        }
      }

      setCampaigns(myCampaigns)

    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      )

      alert(
        "Unable to load dashboard. Please check MetaMask and Sepolia network."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function handleWithdraw(
    campaignIndex: number
  ) {
    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    try {
      setWithdrawing(campaignIndex)

      const provider =
        new BrowserProvider(window.ethereum)

      await provider.send(
        "eth_requestAccounts",
        []
      )

      const signer =
        await provider.getSigner()

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      const transaction =
        await contract.withdraw(
          campaignIndex
        )

      alert(
        "Please confirm the withdrawal in MetaMask..."
      )

      await transaction.wait()

      alert(
        "Funds withdrawn successfully! 🎉"
      )

      await loadDashboard()

    } catch (error) {
      console.error(
        "Withdrawal failed:",
        error
      )

      alert(
        "Withdrawal failed. The campaign may still be active or there may be no funds to withdraw."
      )
    } finally {
      setWithdrawing(null)
    }
  }

  if (loading) {
    return (
      <div className="campaign-details-page">
        <div className="campaign-details-card">
          <h1>Loading Dashboard...</h1>
        </div>
      </div>
    )
  }

  const totalRaised = campaigns
    .reduce(
      (total, campaign) =>
        total +
        Number(
          formatEther(
            campaign.amountCollected
          )
        ),
      0
    )
    .toFixed(4)

  const totalTarget = campaigns
    .reduce(
      (total, campaign) =>
        total +
        Number(
          formatEther(
            campaign.target
          )
        ),
      0
    )
    .toFixed(4)

  return (
    <div className="campaign-details-page">

      <div className="campaign-details-card dashboard-card">

        {/* Dashboard Header */}

        <h1>My Dashboard</h1>

        <p className="dashboard-wallet">
          <strong>Wallet:</strong>{" "}
          {walletAddress.slice(0, 6)}
          ...
          {walletAddress.slice(-4)}
        </p>

        <hr />

        {/* Dashboard Statistics */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <h3>My Campaigns</h3>

            <p>
              {campaigns.length}
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Raised</h3>

            <p>
              {totalRaised} ETH
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Target</h3>

            <p>
              {totalTarget} ETH
            </p>
          </div>

        </div>

        {/* My Campaigns */}

        <h2>My Campaigns</h2>

        {campaigns.length === 0 ? (

          <div className="empty-dashboard">

            <h3>No Campaigns Yet</h3>

            <p>
              You have not created any
              campaigns yet.
            </p>

          </div>

        ) : (

          <div className="dashboard-campaigns">

            {campaigns.map(
              (campaign) => {

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

                const percentage =
                  target > 0
                    ? Math.min(
                        (collected /
                          target) *
                          100,
                        100
                      )
                    : 0

                const deadline =
                  new Date(
                    Number(
                      campaign.deadline
                    ) * 1000
                  )

                const campaignEnded =
                  Date.now() / 1000 >=
                  Number(
                    campaign.deadline
                  )

                const hasFunds =
                  campaign.amountCollected >
                  0n

                const targetReached =
                  campaign.amountCollected >=
                  campaign.target

                return (
                  <div
                    key={
                      campaign.campaignIndex
                    }
                    className="dashboard-campaign"
                  >

                    {/* Campaign Title */}

                    <h3>
                      {campaign.title}
                    </h3>

                    {/* Description */}

                    <p className="dashboard-description">
                      {campaign.description}
                    </p>

                    {/* Raised */}

                    <p>
                      <strong>
                        Raised:
                      </strong>{" "}
                      {collected.toFixed(4)}
                      {" "}
                      ETH
                    </p>

                    {/* Target */}

                    <p>
                      <strong>
                        Target:
                      </strong>{" "}
                      {target.toFixed(4)}
                      {" "}
                      ETH
                    </p>

                    {/* Funding */}

                    <p>
                      <strong>
                        Funding:
                      </strong>{" "}
                      {percentage.toFixed(0)}%
                    </p>

                    {/* Progress Bar */}

                    <div className="progress-background">

                      <div
                        className="progress-bar"
                        style={{
                          width:
                            `${percentage}%`
                        }}
                      ></div>

                    </div>

                    {/* Deadline */}

                    <p>
                      <strong>
                        Deadline:
                      </strong>{" "}
                      {deadline.toLocaleDateString()}
                    </p>

                    {/* View Campaign */}

                    <button
                      className="dashboard-view-button"
                      onClick={() => {
                        window.location.href =
                          `/campaign/${campaign.campaignIndex}`
                      }}
                    >
                      View Campaign
                    </button>

                    {/* STATUS */}

                    {!campaignEnded &&
                      targetReached && (
                        <p className="campaign-status target-reached">
                          <strong>
                            Status:
                          </strong>{" "}
                          Target Reached 🎯
                        </p>
                      )}

                    {!campaignEnded &&
                      !targetReached && (
                        <p className="campaign-status campaign-active">
                          <strong>
                            Status:
                          </strong>{" "}
                          Campaign Active 🟢
                        </p>
                      )}

                    {campaignEnded &&
                      hasFunds && (
                        <div className="ended-section">

                          <p className="campaign-status campaign-ended">
                            <strong>
                              Status:
                            </strong>{" "}
                            Campaign Ended
                          </p>

                          <button
                            className="withdraw-button"
                            onClick={() =>
                              handleWithdraw(
                                campaign.campaignIndex
                              )
                            }
                            disabled={
                              withdrawing ===
                              campaign.campaignIndex
                            }
                          >
                            {withdrawing ===
                            campaign.campaignIndex
                              ? "Withdrawing..."
                              : "Withdraw Funds"}
                          </button>

                        </div>
                      )}

                    {campaignEnded &&
                      !hasFunds && (
                        <p className="campaign-status campaign-ended">
                          <strong>
                            Status:
                          </strong>{" "}
                          Campaign Ended —
                          No funds available
                        </p>
                      )}

                  </div>
                )
              }
            )}

          </div>
        )}

      </div>

    </div>
  )
}

export default Dashboard