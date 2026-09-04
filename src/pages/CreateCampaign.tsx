import { useState } from "react"
import { BrowserProvider, Contract, parseEther } from "ethers"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contract"

function CreateCampaign() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onloadend = () => {
      setImage(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!window.ethereum) {
      alert("Please install MetaMask")
      return
    }

    try {
      setLoading(true)

      const provider = new BrowserProvider(window.ethereum)

      await provider.send("eth_requestAccounts", [])

      const signer = await provider.getSigner()

      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      // Get current number of campaigns
      const existingCampaigns =
        await contract.getCampaigns()

      const campaignIndex = existingCampaigns.length

      const targetInWei = parseEther(target)

      const deadlineTimestamp = Math.floor(
        new Date(deadline).getTime() / 1000
      )

      const transaction = await contract.createCampaign(
        title,
        description,
        targetInWei,
        deadlineTimestamp
      )

      alert(
        "Please confirm the transaction in MetaMask and wait..."
      )

      await transaction.wait()

      // Save image in browser storage
      if (image) {
        localStorage.setItem(
          `fundchain-image-${campaignIndex}`,
          image
        )
      }

      alert("Campaign created successfully!")

      setTitle("")
      setDescription("")
      setTarget("")
      setDeadline("")
      setImage("")

    } catch (error) {
      console.error(error)
      alert(
        "Campaign creation failed. Check MetaMask and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-container">

        <h1>Create a Campaign</h1>

        <p className="create-subtitle">
          Start your campaign and raise funds from the community.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Campaign Title</label>

          <input
            type="text"
            placeholder="Enter campaign title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />

          <label>Description</label>

          <textarea
            placeholder="Describe your campaign"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
          />

          <label>Target Amount (ETH)</label>

          <input
            type="number"
            placeholder="Example: 2"
            value={target}
            onChange={(event) =>
              setTarget(event.target.value)
            }
            min="0"
            step="0.01"
            required
          />

          <label>Deadline</label>

          <input
            type="date"
            value={deadline}
            onChange={(event) =>
              setDeadline(event.target.value)
            }
            required
          />

          <label>Campaign Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {image && (
            <img
              src={image}
              alt="Campaign preview"
              style={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                marginTop: "15px",
                borderRadius: "12px"
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Campaign..."
              : "Create Campaign"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default CreateCampaign