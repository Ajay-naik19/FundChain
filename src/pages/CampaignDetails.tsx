import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  BrowserProvider,
  Contract,
  formatEther,
  parseEther
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

function CampaignDetails() {
  const { id } = useParams()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)
  const [donors, setDonors] = useState<string[]>([])

  async function loadCampaign() {
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

      const campaigns = await contract.getCampaigns()

      const selectedCampaign = campaigns[Number(id)]

      if (!selectedCampaign) {
        alert("Campaign not found")
        return
      }

      setCampaign(selectedCampaign)

      // Load donor addresses
      const donorAddresses: string[] = []
      let donorIndex = 0

      while (true) {
        try {
          const donor = await contract.donors(
            Number(id),
            donorIndex
          )

          donorAddresses.push(donor)
          donorIndex++
        } catch {
          break
        }
      }

      setDonors(donorAddresses)

    } catch (error) {
      console.error("Error loading campaign:", error)
      alert("Unable to load campaign")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaign()
  }, [id])

  async function handleDonate() {
    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid ETH amount")
      return
    }

    if (
      campaign &&
      Date.now() / 1000 >= Number(campaign.deadline)
    ) {
      alert("This campaign has ended")
      return
    }

    try {
      setDonating(true)

      const provider = new BrowserProvider(window.ethereum)

      await provider.send("eth_requestAccounts", [])

      const signer = await provider.getSigner()

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      const donationAmount = parseEther(amount)

      const transaction = await contract.donateToCampaign(
        Number(id),
        {
          value: donationAmount
        }
      )

      alert(
        "Please confirm the transaction in MetaMask and wait..."
      )

      await transaction.wait()

      alert("Donation successful! 🎉")

      setAmount("")

      await loadCampaign()

    } catch (error) {
      console.error("Donation failed:", error)
      alert("Donation failed. Please check MetaMask.")
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="campaign-details-page">
        <div className="campaign-details-card">
          <h1>Loading Campaign...</h1>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="campaign-details-page">
        <div className="campaign-details-card">
          <h1>Campaign Not Found</h1>
        </div>
      </div>
    )
  }

  const raised = formatEther(campaign.amountCollected)
  const target = formatEther(campaign.target)

  const percentage =
    Number(campaign.target) > 0
      ? Math.min(
          (Number(campaign.amountCollected) /
            Number(campaign.target)) *
            100,
          100
        )
      : 0

  const deadline = new Date(
    Number(campaign.deadline) * 1000
  )

  const campaignEnded =
    Date.now() / 1000 >= Number(campaign.deadline)

  const targetReached =
    campaign.amountCollected >= campaign.target

  return (
    <div className="campaign-details-page">

      <div className="campaign-details-card">

        <h1>Campaign Details</h1>

        {/* Campaign Image */}
        {localStorage.getItem(
          `fundchain-image-${Number(id)}`
        ) && (
          <img
            src={
              localStorage.getItem(
                `fundchain-image-${Number(id)}`
              ) || ""
            }
            alt={campaign.title}
            className="campaign-details-image"
          />
        )}

        {/* Campaign Title */}
        <h2>{campaign.title}</h2>

        {/* Description */}
        <p>{campaign.description}</p>

        {/* Campaign Owner */}
        <p>
          <strong>Campaign Owner:</strong>{" "}
          {campaign.owner.slice(0, 6)}...
          {campaign.owner.slice(-4)}
        </p>

        {/* Deadline */}
        <p>
          <strong>Deadline:</strong>{" "}
          {deadline.toLocaleDateString()}
        </p>

        {/* Status */}
        <p>
          <strong>Status:</strong>{" "}
          {campaignEnded
            ? "Campaign Ended"
            : targetReached
            ? "Target Reached"
            : "Campaign Active"}
        </p>

        {/* Progress Bar */}
        <div className="progress-background">
          <div
            className="progress-bar"
            style={{
              width: `${percentage}%`
            }}
          ></div>
        </div>

        <p>
          <strong>
            {percentage.toFixed(0)}% funded
          </strong>
        </p>

        <hr />

        {/* Campaign Statistics */}
        <h3>Campaign Statistics</h3>

        <div className="campaign-stats">

          <div className="campaign-stat">
            <span>Raised</span>
            <strong>
              {Number(raised).toFixed(4)} ETH
            </strong>
          </div>

          <div className="campaign-stat">
            <span>Target</span>
            <strong>
              {Number(target).toFixed(4)} ETH
            </strong>
          </div>

          <div className="campaign-stat">
            <span>Progress</span>
            <strong>
              {percentage.toFixed(0)}%
            </strong>
          </div>

        </div>

        <hr />

        {/* Donors */}
        <h3>Donors</h3>

        {donors.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <div className="donors-list">
            {donors.map((donor, index) => (
              <p key={index}>
                <strong>{index + 1}.</strong>{" "}
                <a
                  href={`https://sepolia.etherscan.io/address/${donor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {donor.slice(0, 6)}...
                  {donor.slice(-4)}
                </a>
              </p>
            ))}
          </div>
        )}

        <hr />

        {/* Donation */}
        <h3>Support this Campaign</h3>

        <input
          type="number"
          placeholder="Enter ETH amount"
          value={amount}
          onChange={(event) =>
            setAmount(event.target.value)
          }
          min="0"
          step="0.001"
        />

        <button
          onClick={handleDonate}
          disabled={donating}
        >
          {donating
            ? "Processing Donation..."
            : "Donate"}
        </button>

      </div>

    </div>
  )
}

export default CampaignDetails